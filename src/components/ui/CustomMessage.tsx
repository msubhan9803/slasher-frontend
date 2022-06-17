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
const RecentMessageNumber = styled.p`
font-size: xx-small;
`;

function CustomMessage({
  userName, message, image, count,
}: Props) {
  return (
    <Row className="d-flex">
      <Col className="position-relative my-auto" md="auto">
        <RecentMessageProfileStatus className="position-absolute bg-success rounded-circle" />
        <div className="">
          <RecentMessageImage src={image} className="rounded-circle bg-secondary position-relative" />
        </div>
      </Col>
      <Col md={7} className="mt-3">
        <p className="mb-0">{userName}</p>
        <RecentMessage>{message}</RecentMessage>
      </Col>
      {count
        && (
          <Col md="auto" className="mt-4 ms-2">
            <RecentMessageNumber className="bg-primary rounded-circle py-1 px-2">
              {count}
            </RecentMessageNumber>
          </Col>
        )}
    </Row>
  );
}
CustomMessage.defaultProps = {
  count: '',
};
export default CustomMessage;
