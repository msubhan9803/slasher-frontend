import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import UserCircleImage from '../UserCircleImage';
import ChatMessageText from '../../chat/ChatMessageText';

interface Props {
  userName: string;
  message: string;
  image: string;
  messageId: string
  count?: number;
}

const MessageSnippet = styled.p`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledItem = styled.div`
  border-bottom: 1px solid var(--bs-dark);
  &:first-of-type {
    padding-top: 0 !important;
  }
  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0 !important;
  }
`;

function UserMessageSidebarListItem({
  userName, message, image, messageId, count,
}: Props) {
  return (
    <StyledItem className="px-2 py-3 d-flex align-items-center">
      <div>
        <Link to={`/app/messages/conversation/${messageId}`} className="text-decoration-none">
          <UserCircleImage size="3.625rem" src={image} alt={`view conversation with ${userName}`} />
        </Link>
      </div>
      <div className="px-3 flex-grow-1 min-width-0">
        <Link to={`/app/messages/conversation/${messageId}`} className="text-decoration-none">
          <p className="mb-0">
            {userName}
          </p>
          <MessageSnippet className="mb-0 small text-light">
            <ChatMessageText message={message} firstLineOnly />
          </MessageSnippet>
        </Link>
      </div>
      {count !== 0 && <span className="text-black badge rounded-pill bg-primary me-3">{count}</span>}
    </StyledItem>
  );
}
UserMessageSidebarListItem.defaultProps = {
  count: 0,
};
export default UserMessageSidebarListItem;
