import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AdminPricingListQueryDto {
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
  @IsString()
  @MaxLength(80)
  search?: string;

  @IsOptional()
  @Transform(({ value }) => [true, 'true'].includes(value))
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Transform(({ value }) => [true, 'true'].includes(value))
  @IsBoolean()
  includeDeleted = false;

  @IsOptional()
  @IsEnum(['name', 'price', 'duration', 'sortOrder', 'createdAt', 'updatedAt'])
  sort = 'sortOrder';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order = 'asc';
}
