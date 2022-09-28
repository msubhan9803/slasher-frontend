import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class ReportUser {
  @Prop({ default: null, ref: 'users' })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null })
  reason: string;
}
export const ReportUserSchema = SchemaFactory.createForClass(ReportUser);
