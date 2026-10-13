// THIRD PARTY IMPORTS
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, unique: true, index: true })
  tx_ref: string;

  @Prop({ required: true, index: true })
  user_uid: string;

  @Prop({ required: true })
  user_email: string;

  @Prop({ required: true, default: 'pro' })
  plan: string;

  @Prop({ default: null, index: true })
  package_uid: string | null;

  @Prop({ default: 'paychangu' })
  provider: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: 'MWK' })
  currency: string;

  @Prop({
    required: true,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  })
  status: string;

  @Prop({ default: null })
  checkout_url: string;

  @Prop({ default: null })
  mode: string;

  @Prop({ default: null })
  charge_id: string;

  @Prop({ default: null })
  channel: string;

  @Prop({ default: null })
  paid_at: Date;

  @Prop({ default: null })
  failed_at: Date | null;

  @Prop({ default: null })
  failure_code: string | null;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ user_uid: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: 1 });
PaymentSchema.index({ plan: 1, createdAt: -1 });
PaymentSchema.index({ provider: 1, charge_id: 1 }, { sparse: true });
