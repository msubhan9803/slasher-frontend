import React from 'react';
import { DateTime } from 'luxon';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Image } from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Notification, NotificationReadStatus } from '../../types';

interface Props {
  notification: Notification;
  lastCard: boolean;
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
function NotificationCard({ notification, lastCard }: Props) {
  return (
  /* eslint no-underscore-dangle: 0 */
    <StyledBorder lastCard={lastCard} key={notification._id} className="d-flex justify-content-between py-3">
      <Link to="/notifications/placeholder-link-target" className="text-decoration-none px-0 shadow-none text-white text-start d-flex align-items-center bg-transparent border-0">
        {notification.senderId && (
        <UserCircleImageContainer className="text-white d-flex justify-content-center align-items-center rounded-circle me-3">
          <Image src={notification.senderId?.profilePic} alt="" className="rounded-circle" />
        </UserCircleImageContainer>
        )}
        <div>
          <div className="d-flex align-items-center">
            <h3 className="h4 mb-0 fw-bold me-1">
              {notification.senderId?.userName}
              <span className="fs-4 mb-0 fw-normal">
                                &nbsp;
                {notification.notificationMsg}
                .&nbsp;&nbsp;
                {notification.isRead === NotificationReadStatus.Unread && (
                <FontAwesomeIcon icon={solid('circle')} className="text-primary" />
                )}
              </span>
            </h3>
          </div>
          <h4 className="h5 mb-0 text-light">{DateTime.fromISO(notification.createdAt).toFormat('MM/dd/yyyy t')}</h4>
        </div>
      </Link>
    </StyledBorder>
  );
}

export default NotificationCard;
