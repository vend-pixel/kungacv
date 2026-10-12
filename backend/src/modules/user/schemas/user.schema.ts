// THIRD PARTY IMPORTS
import { Document } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['admin', 'user'] })
  role: string;

  // Pro entitlement — written only by the payments flow (server-side).
  @Prop({ default: false })
  isPro: boolean;

  @Prop({ default: null })
  proExpiresAt: Date;

  @Prop({ default: null })
  plan: string;

  @Prop({ required: true, default: true })
  active: boolean;

  @Prop({ default: null })
  deleted_by: string;

  @Prop({ default: null })
  deleted_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ active: 1, email: 1 });
UserSchema.index({ active: 1, name: 1 });
