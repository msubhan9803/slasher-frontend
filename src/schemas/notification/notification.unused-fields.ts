import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { FeedComment } from '../feedComment/feedComment.schema';
import { FeedPost } from '../feedPost/feedPost.schema';
import { User } from '../user/user.schema';
import { NotificationType, NotificationStatus } from './notification.enums';

export class NotificationUnusedFields {
  // NOT USED
  @Prop({ required: true, trim: true, default: 'Push' })
  notificationFor: string;

  // NOT USED
  @Prop({
    required: true,
    enum: [
      NotificationType.Type1,
      NotificationType.Type2,
      NotificationType.Type11,
      NotificationType.Type12,
      NotificationType.Type13,
      NotificationType.Type14,
      NotificationType.Type15,
      NotificationType.Type16,
      NotificationType.Type17,
      NotificationType.Type18,
      NotificationType.Type19,
      NotificationType.PostMention,
      NotificationType.Type101,
      NotificationType.Type102,
      NotificationType.Type103,
      NotificationType.Type121,
      NotificationType.Type122,
      NotificationType.Type125,
    ],
  })
  notifyType: NotificationType;

  // NOT USED
  @Prop({ type: Object, default: null })
  data: object;

  // NOT USED
  // Note: In current database, it appears that no Notifications actually have any images stored.
  // Looks like a value or null or an empty array for every record in the DB.
  @Prop({ default: null })
  images: string[];

  @Prop({ default: '5c9c60ca59bf9617c18f6cec', ref: User.name })
  senderId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Array, default: [] })
  allUsers: { type: string[] };

  @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: FeedPost.name })
  feedPostId: FeedPost;

  @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: FeedComment.name })
  feedCommentId: FeedComment;

  // TODO: Fix this typo after old API is retired
  @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: 'feedreplays' })
  feedReplyId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'movies' })
  movieId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null })
  movieDBId: number;

  // NOT USED
  @Prop({ enum: [0, 1], default: 0 })
  isRead: number; // This should be a boolean value, but using number for old API compatibility. 0-false, 1-true

  // NOT USED
  @Prop({
    enum: [NotificationStatus.Inactive, NotificationStatus.Active],
    default: NotificationStatus.Inactive,
  })
  status: number;

  // NOT USED
  @Prop({ enum: [0, 1], default: 0 })
  is_deleted: number; // This should be a boolean value, but using number for old API compatibility. 0-false, 1-true

  // NOT USED
  @Prop({ default: Date.now })
  lastUpdateAt: Date;

  // NOT USED
  @Prop({ default: null, ref: 'movieComments' })
  movieMainCommentID: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'messagePosts' })
  messageMainPostID: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'movieReplays' })
  movieReplyID: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'messageComments' })
  messageCommentID: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'rssFeedProvider' })
  rssFeedProviderId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'rssFeed' })
  rssFeedId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'rssFeedComments' })
  rssFeedCommentId: mongoose.Schema.Types.ObjectId;
}
