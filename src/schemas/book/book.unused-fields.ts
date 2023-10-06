import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { BookDeletionState, BookStatus, BookType } from './book.enums';

export class BookUnusedFields {
  @Prop({ default: null })
  logo: string;

  @Prop({ default: BookType.Free, enum: [BookType.Free, BookType.Paid] })
  type: BookType;

  @Prop({ default: BookStatus.InActive, enum: [BookStatus.InActive, BookStatus.Active, BookStatus.Deactive] })
  status: BookStatus;

  @Prop({ default: BookDeletionState.NotDeleted, enum: [BookDeletionState.NotDeleted, BookDeletionState.Deleted] })
  deleted: BookDeletionState;

  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;
}
