import React from 'react';
import styled from 'styled-components';

interface Props {
  userName: string;
  message: string;
  image: string;
  count?: number;
}

const RecentMessageImage = styled.img`
  height: 3.625rem;
`;

const MessageSnippet = styled.p`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledItem = styled.div`
  border-bottom: 1px solid var(--bs-dark);
  &:first-child {
    padding-top: 0 !important;
  }
  &:last-child {
    border-bottom: none;
    padding-bottom: 0 !important;
  }
`;

function UserMessageListItem({
  userName, message, image, count,
}: Props) {
  return (
    <StyledItem className="px-2 py-3 d-flex align-items-center">
      <div>
        <RecentMessageImage src={image} className="rounded-circle" />
      </div>
      <div className="px-3 flex-grow-1 min-width-0">
        <p className="mb-0">
          {userName}
        </p>
        <MessageSnippet className="mb-0 small text-light">{message}</MessageSnippet>
      </div>
      {count !== 0 && <span className="badge rounded-pill bg-primary me-3">{count}</span>}
    </StyledItem>
  );
}
UserMessageListItem.defaultProps = {
  count: 0,
};
export default UserMessageListItem;
