export enum NotificationType {
  // These are the only ones that are currently in use in the database:
  // (we need to determine what they are, by looking at the notification content)
  Type1 = 1, // related to dating match
  Type2 = 2, // related to mention in groups
  UserSentYouAFriendRequest = 11,
  UserAcceptedYourFriendRequest = 12,
  UserLikedYourPost = 13,
  UserLikedYourComment = 14,
  UserCommentedOnYourPost = 15,
  Type16 = 16,
  Type17 = 17,
  Type18 = 18,
  Type19 = 19,
  UserMentionedYouInPost = 99,

  // In the old API 101 is used for multiple notification types.
  // It would be good if we could change this, and separate these into different types,
  // once the old API is retired.
  UserMentionedYouInAComment = 201,
  UserMentionedYouInACommentReply = 202,
  UserLikedYourReply = 203,
  UserRepliedOnYourPost = 204,
  HashTagPostNotification = 205,
  Type102 = 102,
  Type103 = 103,
  UserMentionedYouInACommentOnANewsPost = 121,
  UserLikedYourCommentOnANewsPost = 122,
  NewPostFromFollowedRssFeedProvider = 125,
  FriendMessageNotification = 126,
}

export enum NotificationStatus {
  Inactive = 0,
  Active = 1,
}

export enum NotificationDeletionStatus {
  NotDeleted = 0,
  Deleted = 1,
}

export enum NotificationReadStatus {
  Unread = 0,
  Read = 1,
}

export const NOTIFICATION_TYPES_TO_CATEGORIES = new Map([
  [NotificationType.UserSentYouAFriendRequest, 'friends_got_a_match'],
  [NotificationType.UserAcceptedYourFriendRequest, 'friends_got_a_match'],
  [NotificationType.UserMentionedYouInPost, 'feed_mention_on_post_comment_reply'],
  [NotificationType.UserCommentedOnYourPost, 'feed_comment_on_post'],
  [NotificationType.UserLikedYourPost, 'feed_post_like'],
  [NotificationType.UserLikedYourComment, 'feed_post_like'],
  [NotificationType.UserMentionedYouInACommentOnANewsPost, 'feed_mention_on_post_comment_reply'],
  [NotificationType.UserMentionedYouInACommentReply, 'feed_mention_on_post_comment_reply'],
  [NotificationType.UserLikedYourReply, 'feed_post_like'],
  [NotificationType.UserRepliedOnYourPost, 'feed_mention_on_post_comment_reply'],
  [NotificationType.FriendMessageNotification, 'friends_message_received'],
  [NotificationType.HashTagPostNotification, 'hashtag_push_notification'],
]);
