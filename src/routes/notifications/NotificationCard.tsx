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

function urlForNotification(notification: Notification) {
  switch (notification.notifyType) {
    case NotificationType.UserSentYouAFriendRequest:
      return `/${notification.userId}/friends/request`;
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
      return `/app/news/partner/${notification.rssFeedProviderId}/posts/${notification.feedPostId._id}`;
    default:
      return '/app/notifications';
  }
}

function NotificationCard({ notification, lastCard, onSelect }: Props) {
  return (
    <StyledBorder lastCard={lastCard} key={notification._id} className="d-flex justify-content-between py-3">
      <Link
        onClick={() => { markRead(notification._id); onSelect!(notification._id); }}
        to={urlForNotification(notification)}
        className="text-decoration-none px-0 text-white text-start d-flex align-items-center bg-transparent border-0"
      >
        {notification.senderId && (
          <UserCircleImageContainer className="text-white d-flex justify-content-center align-items-center rounded-circle me-3">
            <Image src={notification.rssFeedProviderId?.logo || notification.senderId?.profilePic} alt="" className="rounded-circle" />
          </UserCircleImageContainer>
        )}
        <div>
          <div className="d-flex align-items-center">
            <h2 className="h4 mb-0 fw-bold me-1">
              {notification.rssFeedProviderId ? '' : notification.senderId?.userName}
              <span className="fs-4 mb-0 fw-normal">
                &nbsp;
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
