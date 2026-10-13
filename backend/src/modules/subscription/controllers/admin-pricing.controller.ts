import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { CustomRequest } from 'src/shared/interfaces';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../dto';
import { AdminPricingListQueryDto } from '../dto/admin-pricing.dto';
import { SubscriptionService } from '../services/subscriptions.service';

@Controller('admin/pricing')
@UseGuards(AuthGuard)
export class AdminPricingController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  async list(
    @Query() query: AdminPricingListQueryDto,
    @Req() req: CustomRequest,
  ) {
    this.assertAdmin(req);
    return this.subscriptionService.listAdmin(query);
  }

  @Get(':uid')
  async get(@Param('uid') uid: string, @Req() req: CustomRequest) {
    this.assertAdmin(req);
    return { subscription: await this.subscriptionService.findAdmin(uid) };
  }

  @Post()
  async create(
    @Body() payload: CreateSubscriptionDto,
    @Req() req: CustomRequest,
  ) {
    this.assertAdmin(req);
    return {
      subscription: await this.subscriptionService.createAdmin(
        payload,
        req.user.uid,
      ),
    };
  }

  @Patch(':uid')
  async update(
    @Param('uid') uid: string,
    @Body() payload: UpdateSubscriptionDto,
    @Req() req: CustomRequest,
  ) {
    this.assertAdmin(req);
    return {
      subscription: await this.subscriptionService.updateAdmin(
        uid,
        payload,
        req.user.uid,
      ),
    };
  }

  @Post(':uid/activate')
  async activate(@Param('uid') uid: string, @Req() req: CustomRequest) {
    this.assertAdmin(req);
    return {
      subscription: await this.subscriptionService.setActive(
        uid,
        true,
        req.user.uid,
      ),
    };
  }

  @Post(':uid/disable')
  async disable(@Param('uid') uid: string, @Req() req: CustomRequest) {
    this.assertAdmin(req);
    return {
      subscription: await this.subscriptionService.setActive(
        uid,
        false,
        req.user.uid,
      ),
    };
  }

  @Delete(':uid')
  async remove(@Param('uid') uid: string, @Req() req: CustomRequest) {
    this.assertAdmin(req);
    return {
      subscription: await this.subscriptionService.softDelete(
        uid,
        req.user.uid,
      ),
    };
  }

  private assertAdmin(req: CustomRequest) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('admin only');
  }
}
