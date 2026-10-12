// THIRD PARTY IMPORTS
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Resume {
  @Prop({ required: true, unique: true, index: true })
  resume_uid: string;

  @Prop({ required: true, index: true })
  user_uid: string;

  @Prop({ default: 'Untitled resume' })
  title: string;

  @Prop({ default: 'standard' })
  template: string;

  // Whole CV document as one structured JSON object (content, customization, …).
  // Tens of KB at most; edited via whole-document read/write on save.
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  content: Record<string, any>;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
ResumeSchema.index({ user_uid: 1, updatedAt: -1 });
ResumeSchema.index({ resume_uid: 1, user_uid: 1 });
