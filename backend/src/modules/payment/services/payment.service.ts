// THIRD PARTY IMPORTS
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHmac, timingSafeEqual } from 'crypto';
import { nanoid } from 'nanoid';

// INNER IMPORTS
import { Payment } from '../schema/payment.schema';
import { User } from 'src/modules/user/schemas/user.schema';
import { Purchase } from 'src/modules/purchase/schema/purchase.schema';
import { PayChanguService, VerifyResult } from './paychangu.service';
import { InitiatePaymentDto } from '../dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Purchase.name) private purchaseModel: Model<Purchase>,
    private paychanguService: PayChanguService,
    private configService: ConfigService,
  ) {}

  private get price(): number {
    return Number(this.configService.get('paychangu.pro_price_mwk')) || 5000;
  }

  private get passDays(): number {
    return Number(this.configService.get('paychangu.pro_pass_days')) || 30;
  }

  private get clientUrl(): string {
    return this.configService.get('client_url') || 'http://localhost:3001';
  }

  async getPlans() {
    return {
      plans: [
        {
          id: 'pro',
          name: 'KungaCV Pro',
          price: this.price,
          currency: 'MWK',
          days: this.passDays,
        },
      ],
    };
  }

  async initiate(user: any, dto: InitiatePaymentDto) {
    const plan = dto?.plan || 'pro';

    if (plan !== 'pro') {
      throw new BadRequestException('unknown plan');
    }

    const amount = this.price;
    const tx_ref = `kunga_${nanoid(14)}`;
    const firstName = String(user?.name || 'KungaCV')
      .trim()
      .split(/\s+/)[0];
    const lastName =
      String(user?.name || '')
        .trim()
        .split(/\s+/)
        .slice(1)
        .join(' ') || undefined;

    await this.paymentModel.create({
      tx_ref,
      user_uid: user.uid,
      user_email: user.email,
      plan,
      amount,
      currency: 'MWK',
      status: 'pending',
    });

    try {
      const data = await this.paychanguService.initiate({
        amount: String(amount),
        currency: 'MWK',
        email: user.email,
        first_name: firstName,
        ...(lastName ? { last_name: lastName } : {}),
        tx_ref,
        // PayChangu appends tx_ref to the query string on redirect.
        callback_url: `${this.clientUrl}/payment/result`,
        return_url: `${this.clientUrl}/payment/result?status=failed`,
        customization: {
          title: 'KungaCV Pro',
          description: `${this.passDays}-day Pro pass — watermark-free PDF exports`,
        },
      });

      await this.paymentModel.updateOne(
        { tx_ref },
        { checkout_url: data?.checkout_url, mode: data?.data?.mode },
      );

      return {
        tx_ref,
        checkout_url: data?.checkout_url,
        amount,
        currency: 'MWK',
        plan,
        days: this.passDays,
      };
    } catch (err) {
      await this.paymentModel
        .updateOne({ tx_ref, status: 'pending' }, { status: 'failed' })
        .catch(() => undefined);
      throw err;
    }
  }

  async checkStatus(txRef: string, requester: any) {
    const payment = await this.paymentModel.findOne({ tx_ref: txRef });

    if (!payment) {
      throw new NotFoundException('payment not found');
    }

    if (payment.user_uid !== requester?.uid && requester?.role !== 'admin') {
      throw new ForbiddenException();
    }

    const settled = await this.settle(txRef);

    return this.toJSON(settled);
  }

  // Webhook: HMAC-SHA256 over the untouched raw body, then ALWAYS re-query
  // via verify before granting (SECURITY.md / research-paychangu.md).
  async handleWebhook(rawBody: Buffer, signature: string) {
    const secret = this.configService.get('paychangu.webhook_secret');

    if (!secret) {
      throw new BadRequestException('webhook not configured');
    }

    if (!this.isValidSignature(rawBody, signature, secret)) {
      throw new BadRequestException('invalid signature');
    }

    let event: any;
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw new BadRequestException('invalid payload');
    }

    // Standard checkout payloads carry tx_ref; some events only carry the
    // numeric reference — match either against our tx_ref.
    const txRef = event?.tx_ref || event?.reference || event?.data?.tx_ref;

    if (txRef) {
      const payment = await this.paymentModel.findOne({ tx_ref: txRef });

      if (payment && payment.status === 'pending') {
        await this.settle(txRef).catch((err) =>
          this.logger.error(`webhook settle ${txRef}: ${String(err)}`),
        );
      } else if (!payment) {
        this.logger.warn(`webhook for unknown tx_ref ${txRef}`);
      }
    }

    return { received: true };
  }

  private isValidSignature(
    rawBody: Buffer,
    signature: string,
    secret: string,
  ): boolean {
    if (!rawBody || !signature) return false;

    const expected = createHmac('sha256', secret)
      .update(rawBody as any)
      .digest('hex');

    try {
      return timingSafeEqual(
        Buffer.from(expected.toLowerCase(), 'hex') as any,
        Buffer.from(String(signature).toLowerCase(), 'hex') as any,
      );
    } catch {
      return false;
    }
  }

  // Re-query PayChangu for a pending payment and settle idempotently.
  private async settle(txRef: string): Promise<Payment> {
    const payment = await this.paymentModel.findOne({ tx_ref: txRef });

    if (!payment) {
      throw new NotFoundException('payment not found');
    }

    if (payment.status !== 'pending') {
      return payment;
    }

    const data: VerifyResult | null = await this.paychanguService.verify(txRef);

    if (!data) {
      return payment; // gateway unreachable — still pending, client can retry
    }

    const status = String(data.status || '').toLowerCase();

    if (status === 'success') {
      const amount = Number(data.amount);
      const currency = String(data.currency || '').toUpperCase();

      if (amount !== payment.amount || currency !== 'MWK') {
        this.logger.error(
          `integrity check failed for ${txRef}: got ${amount} ${currency}, expected ${payment.amount} MWK`,
        );
        throw new BadRequestException('payment verification failed');
      }

      return this.complete(payment, data);
    }

    if (status === 'failed') {
      await this.paymentModel.updateOne(
        { tx_ref: txRef, status: 'pending' },
        { status: 'failed' },
      );
      return (await this.paymentModel.findOne({ tx_ref: txRef })) || payment;
    }

    return payment; // pending
  }

  private async complete(
    payment: Payment,
    data: VerifyResult,
  ): Promise<Payment> {
    const updated = await this.paymentModel.findOneAndUpdate(
      { tx_ref: payment.tx_ref, status: 'pending' },
      {
        status: 'success',
        mode: data.mode || payment.mode,
        charge_id: data.charge_id || null,
        channel: data.authorization?.channel || data.channel || null,
        paid_at: new Date(),
      },
      { new: true },
    );

    if (!updated) {
      // Another path (webhook race) already settled it.
      return (
        (await this.paymentModel.findOne({ tx_ref: payment.tx_ref })) || payment
      );
    }

    await this.grantPro(payment);

    return updated;
  }

  private async grantPro(payment: Payment) {
    const days = this.passDays;
    const proExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await this.userModel.updateOne(
      { uid: payment.user_uid },
      { isPro: true, proExpiresAt, plan: payment.plan },
    );

    // Reconciliation audit trail in the existing Purchase collection
    // (purchase.schema.ts TODO: "store other transaction ids after payment").
    await this.purchaseModel
      .findOneAndUpdate(
        { purchase_uid: payment.tx_ref },
        {
          $setOnInsert: {
            uid: nanoid(),
            user_uid: payment.user_uid,
            purchase_type: 'individual_transaction',
            purchase_uid: payment.tx_ref,
            price: payment.amount,
            purchased_date: new Date(),
            purchase_valid_till: proExpiresAt,
            purchase_valid_days: days,
            purchase_valid_forever: false,
            active: true,
          },
        },
        { upsert: true },
      )
      .catch((err) =>
        this.logger.error(`purchase audit ${payment.tx_ref}: ${String(err)}`),
      );

    this.logger.log(
      `Pro granted to ${
        payment.user_uid
      } until ${proExpiresAt.toISOString()} (${payment.tx_ref})`,
    );
  }

  private toJSON(payment: Payment) {
    return {
      tx_ref: payment.tx_ref,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      plan: payment.plan,
      paid_at: payment.paid_at,
    };
  }
}
