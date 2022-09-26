import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

// This appears to be unused in the old API.
// For now, favor plain ObjectId array.

@Schema()
export class LikeUser {
  @Prop({ default: null, ref: 'users' })
  userId: mongoose.Schema.Types.ObjectId;
}
export const LikeUserSchema = SchemaFactory.createForClass(LikeUser);
