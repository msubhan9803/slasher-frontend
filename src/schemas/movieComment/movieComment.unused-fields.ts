import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Movie } from '../movie/movie.schema';
import { ReportUserSchema, ReportUser } from '../shared/reportUser.schema';
import { User } from '../user/user.schema';
import { MovieCommentType, MovieCommentStatus, MovieCommentDeletionState } from './movieComment.enums';

export class MovieCommentUnusedFields {
  @Prop({
    type: mongoose.Schema.Types.ObjectId, default: null, ref: Movie.name, required: true,
  })
  movieId: Movie;

  @Prop({
    type: mongoose.Schema.Types.ObjectId, default: null, ref: User.name, required: true,
  })
  userId: User;

  // This field does not exist on any documents in the current prod db
  @Prop({ default: [] })
  hideUsers: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [ReportUserSchema] })
  reportUsers: ReportUser[];

  @Prop({ default: null, required: true })
  comment: string;

  // This is an empty array 100% of the time.  It is not used to support likes.
  // Only the MovieCommentLikes collection is used to store this information.
  @Prop({ default: [] })
  likes: mongoose.Schema.Types.ObjectId[];

  @Prop({
    required: true,
    enum: [
      MovieCommentType.LocalMovieDb,
      // MovieCommentType.ExternalMovieDb,
    ],
    default: MovieCommentType.LocalMovieDb,
  })
  type: MovieCommentType; // Note: Not clear what this actually means, but type is MovieCommentType.LocalMovieDb 100% of the time

  @Prop({
    required: true,
    enum: [
      MovieCommentStatus.Inactive,
      MovieCommentStatus.Active,
      // MovieCommentStatus.Deactivated,
    ],
    default: MovieCommentStatus.Active,
  })
  status: MovieCommentStatus;

  @Prop({
    required: true,
    enum: [
      MovieCommentDeletionState.NotDeleted,
      MovieCommentDeletionState.Deleted,
    ],
    default: MovieCommentDeletionState.NotDeleted,
  })
  deleted: MovieCommentDeletionState;
}
