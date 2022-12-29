export enum NotificationType {
  // These are the only ones that are currently in use in the database:
  // (we need to determine what they are, by looking at the notification content)
  Type1 = 1,
  Type2 = 2,
  UserSentYouAFriendRequest = 11,
  Type12 = 12,
  UserLikedYourPost = 13,
  UserLikedYourComment = 14,
  UserCommentedOnYourPost = 15,
  Type16 = 16,
  Type17 = 17,
  Type18 = 18,
  Type19 = 19,
  UserMentionedYouInPost = 99,
  // for some reason, 101 is used for both "replied on your post" and "liked your reply"
  UserRepliedOnYourPostOrLikedYourReply = 101,
  Type102 = 102,
  Type103 = 103,
  Type121 = 121,
  Type122 = 122,
  NewPostFromFollowedRssFeedProvider = 125,
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
