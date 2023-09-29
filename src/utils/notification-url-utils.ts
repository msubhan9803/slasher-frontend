import { Notification, NotificationType, PostType } from '../types';

function userNameForReceivedFriendRequestNotification(
  notification: Notification,
) {
  const extractedUserName = notification.senderId?.userName === 'Slasher'
    ? notification.notificationMsg.substring(
      0,
      notification.notificationMsg.indexOf(' '),
    )
    : notification.senderId?.userName;
  return extractedUserName;
}

export const urlForNotification = (notification: Notification) => {
  switch (notification.notifyType) {
    case NotificationType.UserAcceptedYourFriendRequest:
    case NotificationType.UserSentYouAFriendRequest:
      // NOTE: The old API app doesn't sent the right user id, so we'll temporarily extract the
      // username from the notificationMsg string.
      // eslint-disable-next-line no-case-declarations
      return `/${userNameForReceivedFriendRequestNotification(notification)}`;
    case NotificationType.HashTagPostNotification:
    case NotificationType.NewPostFromFollowedUser:
      return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}`;
    case NotificationType.UserLikedYourPost:
      if (notification.feedPostId.postType === PostType.MovieReview) {
        return `/app/movies/${notification.feedPostId.movieId}/reviews/${notification.feedPostId._id}`;
      }
      return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}`;
    case NotificationType.UserLikedYourComment:
      if (notification.feedPostId.postType === PostType.MovieReview) {
        return `/app/movies/${notification.feedPostId.movieId}/reviews/${notification.feedPostId._id}?commentId=${notification.feedCommentId}`;
      }
      return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}?commentId=${notification.feedCommentId}`;
    case NotificationType.UserLikedYourReply:
      if (notification.feedPostId.postType === PostType.MovieReview) {
        return `/app/movies/${notification.feedPostId.movieId}/reviews/${notification.feedPostId._id}?commentId=${notification.feedCommentId}&replyId=${notification.feedReplyId}`;
      }
      return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}?commentId=${notification.feedCommentId}&replyId=${notification.feedReplyId}`;
    /*
          NOTE: Not handling the case below right now because RSS Feed Post comments are handled
          in a non-standard way by the old app. So we're temporary omitting them on the server side.
          case NotificationType.UserLikedYourCommentOnANewsPost:
            if (notification.rssFeedProviderId) {
              return `/app/news/partner/${notification.rssFeedProviderId._id}/posts/` +
              `${notification.feedPostId._id}?commentId=${notification.rssFeedCommentId}`;
            }
          NOTE: Not handling the case below right now because RSS Feed Post comments are handled
          in a non-standard way by the old app. So we're temporary omitting them on the server side.
          case UserMentionedYouInACommentOnANewsPost :
            return '';
          */
    case NotificationType.UserCommentedOnYourPost:
    case NotificationType.UserRepliedOnYourPost:
      if (notification.feedPostId.postType === PostType.MovieReview) {
        if (notification.feedReplyId) {
          return `/app/movies/${notification.feedPostId.movieId}/reviews/${notification.feedPostId._id}?commentId=${notification.feedCommentId}&replyId=${notification.feedReplyId}`;
        }
        return `/app/movies/${notification.feedPostId.movieId}/reviews/${notification.feedPostId._id}?commentId=${notification.feedCommentId}`;
      }
      if (notification.feedReplyId) {
        return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}?commentId=${notification.feedCommentId}&replyId=${notification.feedReplyId}`;
      }
      return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}?commentId=${notification.feedCommentId}`;

    case NotificationType.UserMentionedYouInPost:
      if (notification.feedPostId.postType === PostType.MovieReview) {
        return `/app/movies/${notification.feedPostId.movieId}/reviews/${notification.feedPostId._id}`;
      }
      return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}`;
    case NotificationType.UserMentionedYouInAComment:
      if (notification.feedPostId.postType === PostType.MovieReview) {
        return `/app/movies/${notification.feedPostId.movieId}/reviews/${notification.feedPostId._id}?commentId=${notification.feedCommentId}`;
      }
      return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}?commentId=${notification.feedCommentId}`;
    case NotificationType.UserMentionedYouInACommentReply:
      if (notification.feedPostId.postType === PostType.MovieReview) {
        return `/app/movies/${notification.feedPostId.movieId}/reviews/${notification.feedPostId._id}?commentId=${notification.feedCommentId}&replyId=${notification.feedReplyId}`;
      }
      return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}?commentId=${notification.feedCommentId}&replyId=${notification.feedReplyId}`;
      // eslint-disable-next-line max-len
    case NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost:
      if (notification.feedPostId.postType === PostType.MovieReview) {
        if (notification.feedReplyId) {
          return `/app/movies/${notification.feedPostId.movieId}/reviews/${notification.feedPostId._id}?commentId=${notification.feedCommentId}&replyId=${notification.feedReplyId}`;
        }
        if (notification.feedCommentId) {
          return `/app/movies/${notification.feedPostId.movieId}/reviews/${notification.feedPostId._id}?commentId=${notification.feedCommentId}`;
        }
      } else {
        if (notification.feedReplyId) {
          return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}?commentId=${notification.feedCommentId}&replyId=${notification.feedReplyId}`;
        }
        if (notification.feedCommentId) {
          return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}?commentId=${notification.feedCommentId}`;
        }
      }
      return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}`;
    case NotificationType.NewPostFromFollowedRssFeedProvider:
      return `/app/news/partner/${notification.rssFeedProviderId?._id}/posts/${notification.feedPostId._id}`;
    case NotificationType.FriendMessageNotification:
      return `/app/messages/conversation/${notification.matchId}`;
    default:
      return '/app/notifications';
  }
};
