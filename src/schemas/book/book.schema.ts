import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { BookUnusedFields } from './book.unused-fields';
import { BookActiveStatus, BookDeletionState, BookType } from './book.enums';
import { WorthReadingStatus } from '../../types';
import { Image, ImageSchema } from '../shared/image.schema';

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

  @Prop({ default: null, trim: true })
  sort_name: string;

  @Prop({ default: [], trim: true })
  author: string[];

  @Prop({ default: null })
  numberOfPages: number;

  @Prop({ default: [], trim: true })
  isbnNumber: string[];

  @Prop({ default: null })
  publishDate: Date;

  @Prop({ default: null, trim: true })
  sortPublishDate: string;

  @Prop({ default: null })
  description: string;

  @Prop({ default: null })
  coverImageId: number;

  @Prop({ default: null, type: ImageSchema })
  coverImage: Image;

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
    enum: [WorthReadingStatus.NoRating, WorthReadingStatus.Down, WorthReadingStatus.Up],
  })
  worthReading: number;

  @Prop({ default: 0 })
  worthReadingUpUsersCount: number;

  @Prop({ default: 0 })
  worthReadingDownUsersCount: number;

  @Prop({ default: null, trim: true })
  sortRatingAndRatingUsersCount: string;

  @Prop({
    enum: [BookActiveStatus.Inactive, BookActiveStatus.Active, BookActiveStatus.Deactivated],
    default: BookActiveStatus.Inactive,
  })
  status: BookActiveStatus;

  @Prop({ default: BookDeletionState.NotDeleted, enum: [BookDeletionState.NotDeleted, BookDeletionState.Deleted] })
  deleted: BookDeletionState;

  @Prop({ default: BookType.Free, enum: [BookType.Free, BookType.OpenLibrary, BookType.UserDefined] })
  type: BookType;

  @Prop()
  buyUrl?: string;

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
BookSchema.index(
  {
    _id: 1, deleted: 1, status: 1,
  },
);
BookSchema.index(
  {
    sort_name: 1, deleted: 1, status: 1,
  },
);
BookSchema.index(
  {
    publishDate: 1, deleted: 1, status: 1,
  },
);
BookSchema.index(
  {
    publishDate: 1, coverImage: 1, name: 1,
  },
);

export type BookDocument = HydratedDocument<Book>;

// !NOTE - TODO: Using below index throws error for some unknown reason ~ Sahil
// BookSchema.index({
//   name: 1, description: 1, logo: 1, type: 1, status: 1, createdBy: 1, deleted: 1,
// });
