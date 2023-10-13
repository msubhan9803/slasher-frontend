import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { BookUnusedFields } from './book.unused-fields';
import { BookStatus, BookDeletionState } from './book.enums';
import { WorthWatchingStatus } from '../../types';

@Schema({ timestamps: true })
export class Book extends BookUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: [], trim: true })
  author: string[];

  @Prop({ default: null })
  numberOfPages: number;

  @Prop({ default: [], trim: true })
  isbnNumber: string[];

  @Prop({ default: null })
  publishDate: string;

  @Prop({ default: null })
  description: string;

  @Prop({ default: [], trim: true })
  covers: number[];

  @Prop({ required: true })
  coverEditionKey: string;

  @Prop({ default: null })
  bookId: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  ratingUsersCount: number;

  @Prop({ default: 0 })
  goreFactorRating: number;

  @Prop({ default: 0 })
  goreFactorRatingUsersCount: number;

  @Prop({
    default: 0,
    enum: [WorthWatchingStatus.NoRating, WorthWatchingStatus.Down, WorthWatchingStatus.Up],
  })
  worthWatching: number;

  @Prop({ default: 0 })
  worthWatchingUpUsersCount: number;

  @Prop({ default: 0 })
  worthWatchingDownUsersCount: number;

  @Prop({ default: BookStatus.Active, enum: [BookStatus.InActive, BookStatus.Active, BookStatus.Deactive] })
  status: BookStatus;

  @Prop({ default: BookDeletionState.NotDeleted, enum: [BookDeletionState.NotDeleted, BookDeletionState.Deleted] })
  deleted: BookDeletionState;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<Book>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const BookSchema = SchemaFactory.createForClass(Book);

export type BookDocument = HydratedDocument<Book>;

// !NOTE - TODO: Using below index throws error for some unknown reason ~ Sahil
// BookSchema.index({
//   name: 1, description: 1, logo: 1, type: 1, status: 1, createdBy: 1, deleted: 1,
// });
