import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { FeedPost } from '../feedPost/feedPost.schema';
import { Image, ImageSchema } from '../shared/image.schema';
import { ReportUserSchema, ReportUser } from '../shared/reportUser.schema';
import { User } from '../user/user.schema';
import { FeedCommentDeletionState, FeedCommentStatus, FeedCommentType } from './feedComment.enums';

export class FeedCommentUnusedFields {
  @Prop({
    type: mongoose.Schema.Types.ObjectId, default: null, ref: FeedPost.name, required: true,
  })
  feedPostId: FeedPost;

  @Prop({
    type: mongoose.Schema.Types.ObjectId, default: null, ref: User.name, required: true,
  })
  userId: User;

  // So few values exist in the database (54 out of 900,000), and it's not clear whether it's really
  // even in use, so we may be able to delete this field when we retire the old API.
  @Prop({ default: [] })
  hideUsers: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [ReportUserSchema] })
  reportUsers: ReportUser[];

  @Prop({ default: null, required: true })
  message: string;

  @Prop({ default: [] })
  likes: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [ImageSchema] })
  images: Image[];

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

  @Prop({
    required: true,
    enum: [
      FeedCommentStatus.Inactive,
      FeedCommentStatus.Active,
    ],
    default: FeedCommentStatus.Active,
  })
  status: FeedCommentStatus;

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
