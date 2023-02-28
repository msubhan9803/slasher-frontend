import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Movie } from '../movie/movie.schema';
import { User } from '../user/user.schema';
import {
  MovieUserStatusBuy, MovieUserStatusFavorites,
  MovieUserStatusWatch, MovieUserStatusWatched, MovieUserStatusDeletionStatus,
  MovieUserStatusRatingStatus, MovieUserStatusStatus,
} from './movieUserStatus.enums';

@Schema({ timestamps: true })
export class MovieUserStatus {
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

  @Prop({ default: null, ref: Movie.name, required: true })
  movieId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: User.name, required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({
    default: MovieUserStatusFavorites.NotFavorite,
    enum: [MovieUserStatusFavorites.NotFavorite, MovieUserStatusFavorites.Favorite],
  })
  favourite: MovieUserStatusFavorites;

  @Prop({
    default: MovieUserStatusWatch.NotWatch,
    enum: [MovieUserStatusWatch.NotWatch, MovieUserStatusWatch.Watch],
  })
  watch: MovieUserStatusWatch;

  @Prop({
    default: MovieUserStatusWatched.NotWatched,
    enum: [MovieUserStatusWatched.NotWatched, MovieUserStatusWatched.Watched],
  })
  watched: MovieUserStatusWatched;

  @Prop({
    default: MovieUserStatusBuy.NotBuy,
    enum: [MovieUserStatusBuy.NotBuy, MovieUserStatusBuy.Buy],
  })
  buy: MovieUserStatusBuy;

  @Prop({ default: 0 })
  rating: number;

  @Prop({
    default: MovieUserStatusRatingStatus.NotAvailable,
    enum: [MovieUserStatusRatingStatus.NotAvailable, MovieUserStatusRatingStatus.Available],
  })
  ratingStatus: MovieUserStatusRatingStatus;

  @Prop({
    default: MovieUserStatusStatus.Active,
    enum: [MovieUserStatusStatus.InActive, MovieUserStatusStatus.Active, MovieUserStatusStatus.Deactive],
  })
  status: MovieUserStatusStatus;

  @Prop({
    default: MovieUserStatusDeletionStatus.NotDeleted,
    enum: [MovieUserStatusDeletionStatus.NotDeleted, MovieUserStatusDeletionStatus.Deleted],
  })
  deleted: MovieUserStatusDeletionStatus;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<MovieUserStatus>) {
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const MovieUserStatusSchema = SchemaFactory.createForClass(MovieUserStatus);

export type MovieUserStatusDocument = HydratedDocument<MovieUserStatus>;

MovieUserStatusSchema.index({ movieId: 1, userId: 1 });
MovieUserStatusSchema.index({ favourite: 1, userId: 1 });
MovieUserStatusSchema.index({ watch: 1, userId: 1 });
MovieUserStatusSchema.index({ watched: 1, userId: 1 });
MovieUserStatusSchema.index({ buy: 1, userId: 1 });
