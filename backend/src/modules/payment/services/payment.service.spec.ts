// THIRD PARTY IMPORTS
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { createHmac } from 'crypto';

// INNER IMPORTS
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  const paymentModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  const userModel = { updateOne: jest.fn() };
  const purchaseModel = { findOneAndUpdate: jest.fn() };
  const paychanguService = {
    initiate: jest.fn(),
    verify: jest.fn(),
  };
  const WEBHOOK_SECRET = 'whsec_test123';

  const makeConfig = (overrides: Record<string, string> = {}) =>
    ({
      get: jest.fn((key: string) =>
        key in overrides
          ? overrides[key]
          : key === 'paychangu.webhook_secret'
            ? WEBHOOK_SECRET
            : undefined,
      ),
    }) as any;

  let service: PaymentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentService(
      paymentModel as any,
      userModel as any,
      purchaseModel as any,
      paychanguService as any,
      makeConfig(),
    );
  });

  const sign = (rawBody: Buffer, secret = WEBHOOK_SECRET) =>
    createHmac('sha256', secret)
      .update(rawBody as any)
      .digest('hex');

  describe('getPlans', () => {
    it('falls back to 5000 MWK / 30 days when config is empty', async () => {
      service = new PaymentService(
        paymentModel as any,
        userModel as any,
        purchaseModel as any,
        paychanguService as any,
        makeConfig({
          'paychangu.pro_price_mwk': undefined as any,
          'paychangu.pro_pass_days': undefined as any,
        }),
      );

      const { plans } = await service.getPlans();

      expect(plans).toEqual([
        {
          id: 'pro',
          name: 'KungaCV Pro',
          price: 5000,
          currency: 'MWK',
          days: 30,
        },
      ]);
    });

    it('uses configured price and pass days', async () => {
      service = new PaymentService(
        paymentModel as any,
        userModel as any,
        purchaseModel as any,
        paychanguService as any,
        makeConfig({
          'paychangu.pro_price_mwk': '7500',
          'paychangu.pro_pass_days': '60',
        }),
      );

      const { plans } = await service.getPlans();

      expect(plans[0].price).toBe(7500);
      expect(plans[0].days).toBe(60);
    });
  });

  describe('initiate', () => {
    it('rejects an unknown plan id', async () => {
      await expect(
        service.initiate({ uid: 'u1', email: 'a@b.com' }, {
          plan: 'lifetime',
        } as any),
      ).rejects.toThrow(BadRequestException);
      expect(paymentModel.create).not.toHaveBeenCalled();
    });
  });

  describe('checkStatus', () => {
    it('404s for an unknown tx_ref', async () => {
      paymentModel.findOne.mockResolvedValue(null);

      await expect(
        service.checkStatus('kunga_x', { uid: 'u1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('403s when a different user asks about the payment', async () => {
      paymentModel.findOne.mockResolvedValue({
        tx_ref: 'kunga_x',
        user_uid: 'someone-else',
        status: 'pending',
      });

      await expect(
        service.checkStatus('kunga_x', { uid: 'u1', role: 'user' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('lets an admin check any payment', async () => {
      paymentModel.findOne.mockResolvedValue({
        tx_ref: 'kunga_x',
        user_uid: 'someone-else',
        status: 'failed',
        amount: 5000,
        currency: 'MWK',
        plan: 'pro',
      });

      const result = await service.checkStatus('kunga_x', {
        uid: 'a1',
        role: 'admin',
      });

      expect(result).toMatchObject({ tx_ref: 'kunga_x', status: 'failed' });
    });
  });

  describe('isValidSignature', () => {
    const body = Buffer.from('{"tx_ref":"kunga_1","status":"success"}');

    it('accepts the correct HMAC', () => {
      expect(
        (service as any).isValidSignature(body, sign(body), WEBHOOK_SECRET),
      ).toBe(true);
    });

    it('rejects a tampered body', () => {
      const tampered = Buffer.from('{"tx_ref":"kunga_1","status":"failed"}');

      expect(
        (service as any).isValidSignature(tampered, sign(body), WEBHOOK_SECRET),
      ).toBe(false);
    });

    it('rejects a signature made with the wrong secret', () => {
      expect(
        (service as any).isValidSignature(
          body,
          sign(body, 'other'),
          WEBHOOK_SECRET,
        ),
      ).toBe(false);
    });

    it('rejects a truncated signature without throwing', () => {
      expect(
        (service as any).isValidSignature(
          body,
          sign(body).slice(0, 10),
          WEBHOOK_SECRET,
        ),
      ).toBe(false);
    });

    it('rejects empty inputs', () => {
      expect((service as any).isValidSignature(body, '', WEBHOOK_SECRET)).toBe(
        false,
      );
      expect(
        (service as any).isValidSignature(
          undefined,
          sign(body),
          WEBHOOK_SECRET,
        ),
      ).toBe(false);
    });
  });

  describe('handleWebhook', () => {
    const body = Buffer.from(
      JSON.stringify({ tx_ref: 'kunga_1', status: 'success' }),
    );

    it('rejects when no webhook secret is configured', async () => {
      service = new PaymentService(
        paymentModel as any,
        userModel as any,
        purchaseModel as any,
        paychanguService as any,
        makeConfig({ 'paychangu.webhook_secret': undefined as any }),
      );

      await expect(service.handleWebhook(body, sign(body))).rejects.toThrow(
        'webhook not configured',
      );
    });

    it('rejects an invalid signature before parsing', async () => {
      await expect(service.handleWebhook(body, 'deadbeef')).rejects.toThrow(
        'invalid signature',
      );
      expect(paymentModel.findOne).not.toHaveBeenCalled();
    });

    it('rejects non-JSON payloads with a valid signature', async () => {
      const garbage = Buffer.from('not json');

      await expect(
        service.handleWebhook(garbage, sign(garbage)),
      ).rejects.toThrow('invalid payload');
    });

    it('accepts an unknown tx_ref without settling', async () => {
      paymentModel.findOne.mockResolvedValue(null);
      const warn = jest
        .spyOn(service['logger'], 'warn')
        .mockImplementation(() => undefined);

      const result = await service.handleWebhook(body, sign(body));

      expect(result).toEqual({ received: true });
      expect(paymentModel.findOne).toHaveBeenCalledWith({ tx_ref: 'kunga_1' });
      expect(warn).toHaveBeenCalled();
    });

    it('ignores malformed transaction references without querying MongoDB', async () => {
      const warn = jest
        .spyOn(service['logger'], 'warn')
        .mockImplementation(() => undefined);
      const malformed = Buffer.from(
        JSON.stringify({ tx_ref: 'not-a-kunga-reference' }),
      );

      const result = await service.handleWebhook(malformed, sign(malformed));

      expect(result).toEqual({ received: true });
      expect(paymentModel.findOne).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledWith(
        'webhook ignored invalid transaction reference',
      );
    });

    it('settles a pending payment', async () => {
      paymentModel.findOne.mockResolvedValue({
        tx_ref: 'kunga_1',
        status: 'pending',
      });
      const settle = jest
        .spyOn(service as any, 'settle')
        .mockResolvedValue(undefined);

      const result = await service.handleWebhook(body, sign(body));

      expect(result).toEqual({ received: true });
      expect(settle).toHaveBeenCalledWith('kunga_1');
    });

    it('does not re-settle an already failed payment', async () => {
      paymentModel.findOne.mockResolvedValue({
        tx_ref: 'kunga_1',
        status: 'failed',
      });
      const settle = jest.spyOn(service as any, 'settle');

      const result = await service.handleWebhook(body, sign(body));

      expect(result).toEqual({ received: true });
      expect(settle).not.toHaveBeenCalled();
    });

    it('accepts a settle failure and still acks the webhook', async () => {
      paymentModel.findOne.mockResolvedValue({
        tx_ref: 'kunga_1',
        status: 'pending',
      });
      jest
        .spyOn(service as any, 'settle')
        .mockRejectedValue(new Error('gateway down'));
      const error = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation(() => undefined);

      const result = await service.handleWebhook(body, sign(body));

      expect(result).toEqual({ received: true });
      expect(error).toHaveBeenCalled();
    });
  });
});
