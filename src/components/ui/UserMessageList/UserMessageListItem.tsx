import React from 'react';
import styled from 'styled-components';

interface Props {
  userName: string;
  message: string;
  image: string;
  count?: number;
}

const RecentMessageProfileStatus = styled.div`
  height: .5rem;
  width: .5rem;
  right: .75rem;
  bottom: .375rem;
  z-index: 9999;
`;

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
  width:26ch;
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
          <RecentMessageProfileStatus className="position-absolute bg-success rounded-circle" />
          <div>
            <RecentMessageImage src={image} className="rounded-circle bg-secondary position-relative" />
          </div>
        </div>
        <div className="flex-fill">
          <p className="mb-0">{userName}</p>
          <RecentMessage>{message}</RecentMessage>
        </div>
        {count
          && (
            <div>
              <span className="badge rounded-pill text-bg-primary text-white">{count}</span>
            </div>
          )}
      </div>
    </ItemContainer>
  );
}
UserMessageListItem.defaultProps = {
  count: 0,
};
export default UserMessageListItem;
