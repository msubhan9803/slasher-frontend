import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';

const ChatProfileStyleImage = styled(Image)`
height:3.313rem;
width:3.313rem;
border: 1px solid #fff;
`;
const ChatProfileStatus = styled.div`
right: .93rem;
bottom: .18rem;
height: .5rem;
width: .5rem;
z-index:9999;
`;

function ChatUserStatus() {
  return (
    <Row className="d-flex">
      <Col className="position-relative my-auto rounded-circle" xs="auto">
        <ChatProfileStatus className="position-absolute bg-success rounded-circle" />
        <div className="rounded-circle">
          <ChatProfileStyleImage src="https://i.pravatar.cc/300?img=19" className="rounded-circle bg-secondary" />
        </div>
      </Col>
      <Col xs="auto" className="ps-4 ps-sm-2 ps-lg-3 align-self-center">
        <h6 className="mb-0">Eliza Williams</h6>
      </Col>
    </Row>
  );
}

export default ChatUserStatus;
