import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type TemplateDocument = HydratedDocument<Template>;

export enum TemplateAccess {
  FREE = 'free',
  PAID = 'paid',
}

@Schema({ timestamps: true })
export class Template {
  @Prop({ required: true, unique: true, index: true })
  uid: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: null, trim: true })
  description: string | null;

  @Prop({ required: true, min: 1, default: 1 })
  version: number;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  config: Record<string, unknown>;

  @Prop({ default: null })
  previewUrl: string | null;

  @Prop({ default: null })
  previewPublicId: string | null;

  @Prop({ required: true, enum: TemplateAccess, default: TemplateAccess.FREE })
  access: TemplateAccess;

  @Prop({ type: [String], default: [] })
  packageUids: string[];

  @Prop({ default: 0, min: 0 })
  sortOrder: number;

  @Prop({ required: true, default: false })
  published: boolean;

  @Prop({ required: true, default: true })
  active: boolean;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  updatedBy: string;

  @Prop({ default: null })
  deletedAt: Date | null;

  @Prop({ default: null })
  deletedBy: string | null;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
TemplateSchema.index({ active: 1, published: 1, sortOrder: 1 });
TemplateSchema.index({ access: 1, active: 1, published: 1, sortOrder: 1 });
TemplateSchema.index({ packageUids: 1, active: 1, published: 1 });
TemplateSchema.index({ deletedAt: 1 });
