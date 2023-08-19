import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { FeedComment } from '../feedComment/feedComment.schema';
import { FeedPost } from '../feedPost/feedPost.schema';
import { RssFeedProvider } from '../rssFeedProvider/rssFeedProvider.schema';
import { User } from '../user/user.schema';
import {
  NotificationType, NotificationStatus,
} from './notification.enums';

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
      NotificationType.UserSentYouAFriendRequest,
      NotificationType.UserAcceptedYourFriendRequest,
      NotificationType.UserLikedYourPost,
      NotificationType.UserLikedYourComment,
      NotificationType.UserCommentedOnYourPost,
      NotificationType.Type16,
      NotificationType.Type17,
      NotificationType.Type18,
      NotificationType.Type19,
      NotificationType.UserMentionedYouInPost,
      NotificationType.UserMentionedYouInAComment,
      NotificationType.UserMentionedYouInACommentReply,
      NotificationType.UserLikedYourReply,
      NotificationType.UserRepliedOnYourPost,
      NotificationType.Type102,
      NotificationType.Type103,
      NotificationType.UserMentionedYouInACommentOnANewsPost,
      NotificationType.UserLikedYourCommentOnANewsPost,
      NotificationType.NewPostFromFollowedRssFeedProvider,
      NotificationType.HashTagPostNotification,
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

  @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: FeedPost.name })
  feedPostId: FeedPost;

  @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: FeedComment.name })
  feedCommentId: FeedComment;

  // TODO: Fix 'feedreplays' typo after old API is retired. Typo comes from old API.
  @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: 'feedreplays' })
  feedReplyId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: 'movies' })
  movieId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null })
  movieDBId: number;

  @Prop({ default: Date.now })
  lastUpdateAt: Date;

  @Prop({ default: null, ref: 'movieComments' })
  movieMainCommentID: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: 'messagePosts' })
  messageMainPostID: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: 'movieReplays' })
  movieReplyID: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: 'messageComments' })
  messageCommentID: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: RssFeedProvider.name })
  rssFeedProviderId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: 'rssFeed' })
  rssFeedId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: 'rssFeedComments' })
  rssFeedCommentId: mongoose.Schema.Types.ObjectId;

  // TODO: Delete this field when the old API is retired.
  // The old API sets this value to `NotificationStatus.Inactive` 100% of the time, so it is not used.
  @Prop({
    enum: [NotificationStatus.Inactive, NotificationStatus.Active],
    default: NotificationStatus.Inactive,
  })
  status: number;
}
