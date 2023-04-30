import React from 'react';
import { DateTime } from 'luxon';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Image } from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Notification, NotificationReadStatus, NotificationType, PostType,
} from '../../types';
import { markRead } from '../../api/notification';

interface Props {
  notification: Notification;
  lastCard: boolean;
  onSelect: (value: string) => void;
}
interface StyleBorderProps {
  lastCard: boolean;
}
const StyledBorder = styled.div<StyleBorderProps>`
  ${(props) => (props.lastCard
    ? 'border-bottom: none !important; padding-bottom: 0 !important;'
    : 'border-bottom: 1px solid #3A3B46 !important;')}
  svg {
    width: 8px;
  }
`;
const UserCircleImageContainer = styled.div`
  background-color: #171717;
  img {
    height: 50px;
    width: 50px;
  }
`;

function userNameForReceivedFriendRequestNotification(notification: Notification) {
  const extractedUserName = notification.senderId.userName === 'Slasher'
    ? notification.notificationMsg.substring(0, notification.notificationMsg.indexOf(' '))
    : notification.senderId.userName;
  return extractedUserName;
}

function urlForNotification(notification: Notification) {
  switch (notification.notifyType) {
    case NotificationType.UserAcceptedYourFriendRequest:
      return `/${notification.userId}/friends`;
    case NotificationType.UserSentYouAFriendRequest:
      // NOTE: The old API app doesn't sent the right user id, so we'll temporarily extract the
      // username from the notificationMsg string.
      // eslint-disable-next-line no-case-declarations
      return `/${userNameForReceivedFriendRequestNotification(notification)}`;
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
      if (notification.feedPostId.postType === PostType.MovieReview) {
        return `/app/movies/${notification.feedPostId.movieId}/reviews/${notification.feedPostId._id}?commentId=${notification.feedCommentId}`;
      }
      return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}?commentId=${notification.feedCommentId}`;
    case NotificationType.UserMentionedYouInPost:
      if (notification.feedPostId.postType === PostType.MovieReview) {
        return `/app/movies/${notification.feedPostId.movieId}/reviews/${notification.feedPostId._id}`;
      }
      return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}`;
    // eslint-disable-next-line max-len
    case NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost:
      // This enum is very long because the old API has too many things associated with the same
      // notification type id on the backend. We will change this after retiring the old API.
      if (notification.feedPostId.postType === PostType.MovieReview) {
        if (notification.feedReplyId) {
          return `/app/movies/${notification.feedPostId.movieId}/reviews/${notification.feedPostId._id}?commentId=${notification.feedCommentId}&replyId=${notification.feedReplyId}`;
        } if (notification.feedCommentId) {
          return `/app/movies/${notification.feedPostId.movieId}/reviews/${notification.feedPostId._id}?commentId=${notification.feedCommentId}`;
        }
      } else {
        if (notification.feedReplyId) {
          return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}?commentId=${notification.feedCommentId}&replyId=${notification.feedReplyId}`;
        } if (notification.feedCommentId) {
          return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}?commentId=${notification.feedCommentId}`;
        }
      }
      return `/${notification.feedPostId.userId}/posts/${notification.feedPostId._id}`;
    case NotificationType.NewPostFromFollowedRssFeedProvider:
      return `/app/news/partner/${notification.rssFeedProviderId?._id}/posts/${notification.feedPostId._id}`;
    default:
      return '/app/notifications';
  }
}

function NotificationCard({ notification, lastCard, onSelect }: Props) {
  let sender = '';

  if (notification.notifyType === NotificationType.NewPostFromFollowedRssFeedProvider) {
    sender = '';
  } else if (NotificationType.UserSentYouAFriendRequest && notification.senderId.userName === 'Slasher') {
    sender = '';
  } else {
    sender = `${notification.senderId?.userName} `;
  }

  return (
    <StyledBorder lastCard={lastCard} key={notification._id} className="d-flex justify-content-between py-3">
      <Link
        onClick={() => { markRead(notification._id); onSelect!(notification._id); }}
        to={urlForNotification(notification)}
        className="text-decoration-none px-0 text-white text-start d-flex align-items-center bg-transparent border-0"
      >
        {notification.senderId && (
          <UserCircleImageContainer className="text-white d-flex justify-content-center align-items-center rounded-circle me-3">
            <Image
              src={
                notification.notifyType === NotificationType.NewPostFromFollowedRssFeedProvider
                  ? notification.rssFeedProviderId?.logo
                  : notification.senderId?.profilePic
              }
              alt=""
              className="rounded-circle"
            />
          </UserCircleImageContainer>
        )}
        <div>
          <div className="d-flex align-items-center">
            <h2 className="h4 mb-0 me-1">
              {sender}
              <span className="fs-4 mb-0 fw-normal">
                {notification.notificationMsg}
                .&nbsp;&nbsp;
                {notification.isRead === NotificationReadStatus.Unread && (
                  <FontAwesomeIcon icon={solid('circle')} className="text-primary" />
                )}
              </span>
            </h2>
          </div>
          <h3 className="h5 mb-0 text-light">{DateTime.fromISO(notification.createdAt).toFormat('MM/dd/yyyy t')}</h3>
        </div>
      </Link>
    </StyledBorder>
  );
}

export default NotificationCard;
