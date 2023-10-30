import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class BookUnusedFields {
  @Prop({ default: null })
  logo: string;

  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;
}
