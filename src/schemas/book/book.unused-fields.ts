import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { BookDeletionState, BookStatus, BookType } from './book.enums';

export class BookUnusedFields {
  @Prop({ default: null })
  descriptions: string;

  @Prop({ default: null })
  logo: string;

  @Prop({ default: BookType.Free })
  type: BookType;

  @Prop({ default: BookStatus.InActive })
  status: BookStatus;

  @Prop({ default: BookDeletionState.NotDeleted })
  deleted: BookDeletionState;

  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;
}
