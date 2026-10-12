// THIRD PARTY IMPORTS
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

// INNER IMPORTS
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { RateLimit } from 'src/shared/guards/rate-limit.decorator';
import { CustomRequest } from 'src/shared/interfaces';
import { InitiatePaymentDto } from '../dto';
import { PaymentService } from '../services/payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  // Public — lets the pricing page show the real server-configured price.
  @Get('/plans')
  async getPlans() {
    return this.paymentService.getPlans();
  }

  @Post('/initiate')
  @UseGuards(AuthGuard)
  @RateLimit({ name: 'payment-initiate', limit: 10, windowMs: 60_000 })
  async initiate(@Body() dto: InitiatePaymentDto, @Req() req: CustomRequest) {
    return { payment: await this.paymentService.initiate(req.user, dto) };
  }

  // PayChangu server-to-server callback — authenticated by the HMAC
  // `Signature` header, not by JWT.
  @Post('/webhook')
  @RateLimit({ name: 'payment-webhook', limit: 120, windowMs: 60_000 })
  async webhook(@Req() req: Request) {
    const rawBody: Buffer = (req as any).rawBody;
    const signature = String(req.headers['signature'] || '');

    return this.paymentService.handleWebhook(rawBody, signature);
  }

  @Get('/:tx_ref/status')
  @UseGuards(AuthGuard)
  async status(@Param('tx_ref') txRef: string, @Req() req: CustomRequest) {
    return { payment: await this.paymentService.checkStatus(txRef, req.user) };
  }
}
