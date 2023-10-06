import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { BookType } from './book.enums';

export class BookUnusedFields {
  @Prop({ default: null })
  logo: string;

  @Prop({ default: BookType.Free, enum: [BookType.Free, BookType.Paid] })
  type: BookType;

  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;
}
