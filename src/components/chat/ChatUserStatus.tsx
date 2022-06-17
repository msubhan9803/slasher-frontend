import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';

const ChatProfileStyleImage = styled(Image)`
border-radius: 50%;
height: 50px;
width: 50px;
border: 1px solid #fff;
`;

function ChatUserStatus() {
  return (
    <Row className="align-items-center">
      <Col xs={1} className="d-sm-none ps-2">
        <FontAwesomeIcon icon={solid('arrow-left')} size="2x" />
      </Col>
      <Col xs={2} lg={1} className="ps-3">
        <ChatProfileStyleImage src="https://i.pravatar.cc/150?img=19" alt="Chat Other Profile" />
      </Col>
      <Col xs={9} sm={10} lg={11} className="ps-4 ps-sm-2 ps-lg-3">
        <h6 className="mb-0">Eliza Williams</h6>
        <p className="mb-0 small text-success">Online</p>
      </Col>
    </Row>
  );
}

export default ChatUserStatus;
