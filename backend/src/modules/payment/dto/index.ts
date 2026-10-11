// THIRD PARTY IMPORTS
import { IsIn, IsOptional, IsString } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  @IsOptional()
  @IsIn(['pro'], { message: 'unknown plan' })
  plan?: string;
}
