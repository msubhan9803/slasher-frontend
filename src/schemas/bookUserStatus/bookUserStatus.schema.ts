import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Book } from '../book/book.schema';
import { User } from '../user/user.schema';
import {
  BookUserStatusBuy, BookUserStatusFavorites,
  BookUserStatusWatch, BookUserStatusWatched, BookUserStatusDeletionStatus,
  BookUserStatusRatingStatus, BookUserStatusStatus,
} from './bookUserStatus.enums';
import { WorthWatchingStatus } from '../../types';

@Schema({ timestamps: true })
export class BookUserStatus {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ default: null, trim: true })
  name: string;

  @Prop({ default: null, ref: Book.name, required: true })
  bookId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: User.name, required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({
    default: BookUserStatusFavorites.NotFavorite,
    enum: [BookUserStatusFavorites.NotFavorite, BookUserStatusFavorites.Favorite],
  })
  favourite: BookUserStatusFavorites;

  @Prop({
    default: BookUserStatusWatch.NotWatch,
    enum: [BookUserStatusWatch.NotWatch, BookUserStatusWatch.Watch],
  })
  watch: BookUserStatusWatch;

  @Prop({
    default: BookUserStatusWatched.NotWatched,
    enum: [BookUserStatusWatched.NotWatched, BookUserStatusWatched.Watched],
  })
  watched: BookUserStatusWatched;

  @Prop({
    default: BookUserStatusBuy.NotBuy,
    enum: [BookUserStatusBuy.NotBuy, BookUserStatusBuy.Buy],
  })
  buy: BookUserStatusBuy;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  goreFactorRating: number;

  @Prop({
    default: 0,
    enum: [WorthWatchingStatus.NoRating, WorthWatchingStatus.Down, WorthWatchingStatus.Up],
  })
  worthWatching: number;

  @Prop({
    default: BookUserStatusRatingStatus.NotAvailable,
    enum: [BookUserStatusRatingStatus.NotAvailable, BookUserStatusRatingStatus.Available],
  })
  ratingStatus: BookUserStatusRatingStatus;

  @Prop({
    default: BookUserStatusStatus.Active,
    enum: [BookUserStatusStatus.InActive, BookUserStatusStatus.Active, BookUserStatusStatus.Deactive],
  })
  status: BookUserStatusStatus;

  @Prop({
    default: BookUserStatusDeletionStatus.NotDeleted,
    enum: [BookUserStatusDeletionStatus.NotDeleted, BookUserStatusDeletionStatus.Deleted],
  })
  deleted: BookUserStatusDeletionStatus;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<BookUserStatus>) {
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const BookUserStatusSchema = SchemaFactory.createForClass(BookUserStatus);

export type BookUserStatusDocument = HydratedDocument<BookUserStatus>;

BookUserStatusSchema.index({ bookId: 1, userId: 1 });
BookUserStatusSchema.index({ favourite: 1, userId: 1 });
BookUserStatusSchema.index({ watch: 1, userId: 1 });
BookUserStatusSchema.index({ watched: 1, userId: 1 });
BookUserStatusSchema.index({ buy: 1, userId: 1 });
