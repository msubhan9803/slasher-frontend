import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Image, ImageSchema } from '../shared/image.schema';
import { ReportUserSchema, ReportUser } from '../shared/reportUser.schema';
import { FeedCommentDeletionState, FeedCommentStatus, FeedCommentType } from './feedComment.enums';

export class FeedCommentUnusedFields {
  // NOT USED
  @Prop({ default: null, ref: 'feedPosts', required: true })
  feedPostId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'users', required: true })
  userId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: [] })
  hideUsers: mongoose.Schema.Types.ObjectId[];

  // NOT USED
  @Prop({ type: [ReportUserSchema] })
  reportUsers: ReportUser[];

  // NOT USED
  @Prop({ default: null, required: true })
  message: string;

  // NOT USED
  @Prop({ default: [] })
  likes: mongoose.Schema.Types.ObjectId[];

  // NOT USED
  @Prop({ type: [ImageSchema] })
  images: Image[];

  // NOT USED
  @Prop({
    required: true,
    enum: [
      FeedCommentType.Text,
      FeedCommentType.Images,
      FeedCommentType.TextAndImages,
    ],
    default: FeedCommentType.Text,
  })
  type: FeedCommentType; // Note: It appears that old API may only ever use FeedCommentType.Text

  // NOT USED
  @Prop({
    required: true,
    enum: [
      FeedCommentStatus.Inactive,
      FeedCommentStatus.Active,
    ],
    default: FeedCommentStatus.Active,
  })
  status: FeedCommentStatus;

  // NOT USED
  @Prop({
    required: true,
    enum: [
      FeedCommentDeletionState.NotDeleted,
      FeedCommentDeletionState.Deleted,
    ],
    default: FeedCommentDeletionState.NotDeleted,
  })
  is_deleted: FeedCommentDeletionState;
}
