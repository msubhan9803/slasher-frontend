import React from 'react';
import { Col, Row } from 'react-bootstrap';
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
`;

const ItemContainer = styled.div`
  border-bottom: 1px solid rgb(23, 23, 24);
  &:last-child {
    border-bottom: none;
  }
  padding: .5rem 0;
`;

function UserMessageListItem({
  userName, message, image, count,
}: Props) {
  return (
    <ItemContainer>
      <Row className="d-flex">
        <Col className="position-relative my-auto" md="auto">
          <RecentMessageProfileStatus className="position-absolute bg-success rounded-circle" />
          <div className="">
            <RecentMessageImage src={image} className="rounded-circle bg-secondary position-relative" />
          </div>
        </Col>
        <Col className="mt-3">
          <p className="mb-0">{userName}</p>
          <RecentMessage>{message}</RecentMessage>
        </Col>
        {count
          && (
            <Col md="auto" className="text-end mt-4 ms-2">
              <span className="badge rounded-pill text-bg-primary text-white">{count}</span>
            </Col>
          )}
      </Row>
    </ItemContainer>
  );
}
UserMessageListItem.defaultProps = {
  count: 0,
};
export default UserMessageListItem;
