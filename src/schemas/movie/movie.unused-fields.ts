import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { MovieActiveStatus, MovieDeletionStatus, MovieType } from './movie.enums';

export class MovieUnusedFields {
  // NOT USED
  @Prop({ default: null, trim: true })
  name: string;

  // NOT USED
  @Prop({ default: null, trim: true })
  sort_name: string;

  // NOT USED
  @Prop({ default: null })
  descriptions: string;

  // NOT USED
  @Prop({ default: null })
  logo: string;

  // NOT USED
  @Prop({ default: null })
  movieDBId: number;

  // NOT USED
  @Prop({ default: null })
  backDropPath: string;

  // NOT USED
  @Prop({ default: null })
  releaseDate: Date;

  // NOT USED
  @Prop({ default: false })
  adult: boolean;

  // NOT USED
  @Prop({
    enum: [
      MovieType.Free,
      MovieType.MovieDb,
    ],
    default: MovieType.Free,
  })
  type: MovieType;

  // NOT USED
  @Prop({ default: 0 })
  popularity: number;

  // NOT USED
  @Prop({
    enum: [
      MovieActiveStatus.Inactive,
      MovieActiveStatus.Active,
      MovieActiveStatus.Deactivated,
    ],
    default: MovieActiveStatus.Inactive,
  })
  status: MovieActiveStatus;

  // NOT USED
  @Prop({
    enum: [
      MovieDeletionStatus.NotDeleted,
      MovieDeletionStatus.Deleted,
    ],
    default: MovieDeletionStatus.NotDeleted,
  })
  deleted: MovieDeletionStatus;

  // NOT USED
  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: 0 })
  rating: number;
}
