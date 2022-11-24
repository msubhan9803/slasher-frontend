import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { MovieComment } from '../movieComment/movieComment.schema';
import { ReportUserSchema, ReportUser } from '../shared/reportUser.schema';
import { User } from '../user/user.schema';
import { MovieReplyType, MovieReplyStatus, MovieReplyDeletionState } from './movieReply.enums';

export class MovieReplyUnusedFields {
  @Prop({
    type: mongoose.Schema.Types.ObjectId, default: null, ref: MovieComment.name, required: true,
  })
  movieCommentId: MovieComment;

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
  message: string;

  // This is an empty array 100% of the time.  It is not used to support likes.
  // Only the MovieReplyLikes collection is used to store this information.
  @Prop({ default: [] })
  likes: mongoose.Schema.Types.ObjectId[];

  @Prop({
    required: true,
    enum: [
      MovieReplyType.LocalMovieDb,
      // MovieReplyType.ExternalMovieDb,
    ],
    default: MovieReplyType.LocalMovieDb,
  })
  type: MovieReplyType; // Note: Not clear what this actually means, but type is MovieReplyType.LocalMovieDb 100% of the time

  @Prop({
    required: true,
    enum: [
      MovieReplyStatus.Inactive,
      MovieReplyStatus.Active,
      // MovieReplyStatus.Deactivated,
    ],
    default: MovieReplyStatus.Active,
  })
  status: MovieReplyStatus;

  @Prop({
    required: true,
    enum: [
      MovieReplyDeletionState.NotDeleted,
      MovieReplyDeletionState.Deleted,
    ],
    default: MovieReplyDeletionState.NotDeleted,
  })
  deleted: MovieReplyDeletionState;
}
