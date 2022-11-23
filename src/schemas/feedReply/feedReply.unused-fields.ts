import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Image, ImageSchema } from '../shared/image.schema';
import { ReportUserSchema, ReportUser } from '../shared/reportUser.schema';
import { FeedReplyDeletionState, FeedReplyStatus, FeedReplyType } from './feedReply.enums';

export class FeedReplyUnusedFields {

  // NOT USED
  @Prop({ default: null, ref: 'feedPosts' })
  feedPostId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: [] })
  likes: mongoose.Schema.Types.ObjectId[];

  // NOT USED
  @Prop({ default: [] })
  hideUsers: mongoose.Schema.Types.ObjectId[];

  // NOT USED
  @Prop({ type: [ReportUserSchema] })
  reportUsers: ReportUser[];

  // NOT USED
  @Prop({
    required: true,
    enum: [
      // These values don't make sense here, but this what the old API uses
      FeedReplyType.LocalMovieDb,
      FeedReplyType.ExternalMovieDb,
    ],
    default: FeedReplyType.LocalMovieDb,
  })
  type: FeedReplyType; // Note: It appears that old API may only ever use FeedReplyType.LocalMovieDb

  // NOT USED
  @Prop({
    required: true,
    enum: [
      FeedReplyStatus.Inactive,
      FeedReplyStatus.Active,
    ],
    default: FeedReplyStatus.Active,
  })
  status: FeedReplyStatus;

}
