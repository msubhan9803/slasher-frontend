import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class MovieUnusedFields {
  // NOT USED
  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;
}
