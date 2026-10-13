import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { CustomRequest } from 'src/shared/interfaces';
import { AdminPaymentListQueryDto } from '../dto/admin-payment.dto';
import { PaymentService } from '../services/payment.service';

@Controller('admin/payments')
@UseGuards(AuthGuard)
export class AdminPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  async list(
    @Query() query: AdminPaymentListQueryDto,
    @Req() req: CustomRequest,
  ) {
    this.assertAdmin(req);
    return this.paymentService.listAdmin(query);
  }

  @Get(':txRef')
  async get(@Param('txRef') txRef: string, @Req() req: CustomRequest) {
    this.assertAdmin(req);
    return { payment: await this.paymentService.findAdmin(txRef) };
  }

  private assertAdmin(req: CustomRequest) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('admin only');
  }
}
