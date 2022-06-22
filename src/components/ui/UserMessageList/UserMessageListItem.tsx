import React from 'react';
import styled from 'styled-components';

interface Props {
  userName: string;
  message: string;
  image: string;
  count?: number;
}

const RecentMessageImage = styled.img`
  height:3.313rem;
  width:3.313rem;
`;

const RecentMessage = styled.p`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: .75rem;
  color: #CCCCCC;
  max-width: 26ch;
  margin-bottom: 0;
`;

const ItemContainer = styled.div`
  border-bottom: 1px solid rgb(23, 23, 24);
  &:last-child {
    border-bottom: none;
  }
`;

function UserMessageListItem({
  userName, message, image, count,
}: Props) {
  return (
    <ItemContainer className="py-2">
      <div className="d-flex align-items-center">
        <div>
          <RecentMessageImage src={image} className="me-3 rounded-circle bg-secondary position-relative" />
        </div>
        <div className="flex-fill overflow-hidden">
          <p className="mb-0">{userName}</p>
          <RecentMessage>{message}</RecentMessage>
        </div>
        {count && <div><span className="badge rounded-pill text-bg-primary text-white ms-3">{count}</span></div>}
      </div>
    </ItemContainer>
  );
}
UserMessageListItem.defaultProps = {
  count: 0,
};
export default UserMessageListItem;
