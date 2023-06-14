import React from 'react';
import { DateTime } from 'luxon';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Image } from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Notification, NotificationReadStatus, NotificationType,
} from '../../types';
import { markRead } from '../../api/notification';
import { urlForNotification } from '../../utils/notification-url-utils';

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

function NotificationCard({ notification, lastCard, onSelect }: Props) {
  let sender = '';

  if (notification.notifyType === NotificationType.NewPostFromFollowedRssFeedProvider) {
    sender = '';
  } else if ((NotificationType.UserSentYouAFriendRequest || NotificationType.UserAcceptedYourFriendRequest) && notification.senderId.userName === 'Slasher') {
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
            <h2 className="h4 mb-0 me-1 fw-normal">
              {sender}
              <span className="fs-4 mb-0">
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
