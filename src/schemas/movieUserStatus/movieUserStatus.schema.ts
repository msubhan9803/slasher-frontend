import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import {
 MovieUserStatusBuy, MovieUserStatusFavorites, MovieUserStatusRating,
 MovieUserStatusWatch, MovieUserStatusWatched, MovieUserStatusDeletionStatus,
 MovieUserStatusRatingStatus, MovieUserStatusStatus,
} from './movieUserStatus.enums';

@Schema({ timestamps: true })
export class Movie {
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

  @Prop({ default: null, ref: 'movies' })
  movieId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: 'users' })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: MovieUserStatusFavorites.NotFavorite })
  favourite: MovieUserStatusFavorites;

  @Prop({ default: MovieUserStatusWatch.NotWatch })
  watch: MovieUserStatusWatch;

  @Prop({ default: MovieUserStatusWatched.NotWatched })
  watched: MovieUserStatusWatched;

  @Prop({ default: MovieUserStatusBuy.NotBuy })
  buy: MovieUserStatusBuy;

  @Prop({ default: MovieUserStatusRating.Free })
  rating: MovieUserStatusRating;

  @Prop({ default: MovieUserStatusRatingStatus.NotAvailable })
  ratingStatus: MovieUserStatusRatingStatus;

  @Prop({ default: MovieUserStatusStatus.Active })
  status: MovieUserStatusStatus;

  @Prop({ default: MovieUserStatusDeletionStatus.NotDeleted })
  deleted: MovieUserStatusDeletionStatus;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<Movie>) {
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const MovieUserStatusSchema = SchemaFactory.createForClass(Movie);

export type MovieUserStatusDocument = Movie & Document;

MovieUserStatusSchema.index({ movieId: 1, userId: 1 });
MovieUserStatusSchema.index({ favourite: 1, userId: 1 });
MovieUserStatusSchema.index({ watch: 1, userId: 1 });
MovieUserStatusSchema.index({ watched: 1, userId: 1 });
MovieUserStatusSchema.index({ buy: 1, userId: 1 });
