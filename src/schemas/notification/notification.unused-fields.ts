import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { NotificationType, NotificationStatus } from './notification.enums';

export class NotificationUnusedFields {
  // NOT USED
  @Prop({ required: true, trim: true, default: 'Push' })
  notificationFor: string;

  // NOT USED
  @Prop({
    required: true,
    enum: [
      NotificationType.Match,
      NotificationType.MessageBoard,
      NotificationType.ViewProfile,
      NotificationType.Message,
      // NOTE: Not adding other types because they're just placeholders
    ],
    default: NotificationType.Match,
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

  // NOT USED
  @Prop({ default: '5c9c60ca59bf9617c18f6cec', ref: 'users' })
  senderId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ type: Array, default: [] })
  allUsers: { type: string[] };

  // NOT USED
  @Prop({ default: null, ref: 'feedPosts' })
  feedPostId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'feedComments' })
  feedCommentId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'feedreplays' })
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
