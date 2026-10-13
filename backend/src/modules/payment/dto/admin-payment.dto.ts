import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum PaymentStatusFilter {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export class AdminPaymentListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  perPage = 25;

  @IsOptional()
  @IsEnum(PaymentStatusFilter)
  status?: PaymentStatusFilter;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  plan?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  userUid?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  txRef?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(['createdAt', 'paid_at', 'amount', 'status'])
  sort = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order = 'desc';
}
