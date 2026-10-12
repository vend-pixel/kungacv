// THIRD PARTY IMPORTS
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const PAYCHANGU_API = 'https://api.paychangu.com';
const GATEWAY_TIMEOUT_MS = 10_000;

export interface VerifyResult {
  tx_ref?: string;
  reference?: string;
  status?: string;
  amount?: number | string;
  currency?: string;
  mode?: string;
  charge_id?: string;
  channel?: string;
  authorization?: { channel?: string };
}

@Injectable()
export class PayChanguService {
  private readonly logger = new Logger(PayChanguService.name);

  constructor(private configService: ConfigService) {}

  private get secretKey(): string {
    return this.configService.get('paychangu.secret_key');
  }

  private assertConfigured(): void {
    if (!this.secretKey) {
      throw new BadRequestException(
        'payments are not configured (PAYCHANGU_SECRET_KEY missing)',
      );
    }
  }

  // POST https://api.paychangu.com/payment — returns { checkout_url, data }.
  async initiate(payload: Record<string, unknown>): Promise<any> {
    this.assertConfigured();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GATEWAY_TIMEOUT_MS);

    let res: any;
    try {
      res = await (globalThis as any).fetch(`${PAYCHANGU_API}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.secretKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err) {
      this.logger.error(`initiate request failed: ${String(err)}`);
      throw new BadGatewayException('payment gateway unavailable');
    } finally {
      clearTimeout(timeout);
    }

    const json = await res.json().catch(() => null);

    if (!res.ok || json?.status !== 'success') {
      this.logger.error(`initiate failed: ${JSON.stringify(json)}`);
      throw new BadGatewayException('could not start payment with gateway');
    }

    return json.data;
  }

  // GET https://api.paychangu.com/verify-payment/{tx_ref} — server-side re-query
  // mandated by PayChangu before granting (research-paychangu.md).
  async verify(txRef: string): Promise<VerifyResult | null> {
    this.assertConfigured();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GATEWAY_TIMEOUT_MS);

    try {
      const res: any = await (globalThis as any).fetch(
        `${PAYCHANGU_API}/verify-payment/${encodeURIComponent(txRef)}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${this.secretKey}`,
          },
          signal: controller.signal,
        },
      );

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.data) {
        this.logger.warn(
          `verify ${txRef}: ${res.status} ${JSON.stringify(json)}`,
        );
        return null;
      }

      return json.data;
    } catch (err) {
      this.logger.error(`verify ${txRef} failed: ${String(err)}`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
