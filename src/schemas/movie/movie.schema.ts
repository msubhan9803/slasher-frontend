import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  Cast,
  MovieActiveStatus, MovieDeletionStatus, MovieType,
} from './movie.enums';
import { MovieUnusedFields } from './movie.unused-fields';
import { WorthWatchingStatus } from '../../types';

@Schema({ timestamps: true })
export class Movie extends MovieUnusedFields {
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

  @Prop({ default: null, trim: true })
  sort_name: string;

  @Prop({ default: null, trim: true })
  sortReleaseDate: string;

  @Prop({ type: Array, default: null, trim: true })
  trailerUrls: string[];

  @Prop({ default: null, trim: true })
  countryOfOrigin: string;

  @Prop({ default: null, trim: true })
  durationInMinutes: number;

  @Prop({ default: null, trim: true })
  contentRating: string;

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

  @Prop({ default: null, trim: true })
  sortRatingAndRatingUsersCount: string;

  @Prop({
    enum: [
      MovieActiveStatus.Inactive,
      MovieActiveStatus.Active,
      MovieActiveStatus.Deactivated,
    ],
    default: MovieActiveStatus.Inactive,
  })
  status: MovieActiveStatus;

  @Prop({
    enum: [
      MovieDeletionStatus.NotDeleted,
      MovieDeletionStatus.Deleted,
    ],
    default: MovieDeletionStatus.NotDeleted,
  })
  deleted: MovieDeletionStatus;

  @Prop({ default: null })
  releaseDate: Date;

  @Prop({ default: null })
  descriptions: string;

  @Prop({ default: null })
  logo: string;

  @Prop({ default: null, unique: true })
  movieDBId: number;

  @Prop({ default: null })
  backDropPath: string;

  @Prop({ default: false })
  adult: boolean;

  @Prop({
    enum: [
      MovieType.Free,
      MovieType.MovieDb,
      MovieType.UserDefined,
    ],
    default: MovieType.Free,
  })
  type: MovieType;

  @Prop({ default: 0 })
  popularity: number;

  @Prop({ default: null })
  movieImage: string;

  @Prop([{ castImage: String, name: String, characterName: String }])
  casts?: Cast[];

  @Prop()
  watchUrl?: string;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<Movie>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
MovieSchema.index(
  {
    _id: 1, deleted: 1, status: 1,
  },
);
MovieSchema.index(
  {
    sort_name: 1, deleted: 1, status: 1,
  },
);
MovieSchema.index(
  {
    releaseDate: 1, deleted: 1, status: 1,
  },
);
MovieSchema.index(
  {
    releaseDate: 1, logo: 1, name: 1,
  },
);

// TODO: Perform test queries with mongodb explain() to determine what keys would be best for MoviesService#findAll

// MovieSchema.index(
//   {
//     releaseDate: 1, type: 1, status: 1, deleted: 1, sort_name: 1, sortReleaseDate: 1, sortRating: 1, name: 1,
//   },
// );
export type MovieDocument = HydratedDocument<Movie>;
