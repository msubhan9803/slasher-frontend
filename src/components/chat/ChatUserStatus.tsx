import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';

const ChatProfileStyleImage = styled(Image)`
  height:3.313rem;
  width:3.313rem;
`;

function ChatUserStatus() {
  return (
    <Row className="d-flex align-items-center">
      <Col xs={1} className="d-sm-none ps-2">
        <FontAwesomeIcon icon={solid('arrow-left')} size="2x" />
      </Col>
      <Col className="position-relative my-auto rounded-circle" xs="auto">
        <div className="rounded-circle ps-2">
          <ChatProfileStyleImage src="https://i.pravatar.cc/300?img=22" className="rounded-circle bg-secondary" />
        </div>
      </Col>
      <Col xs="auto" className="ps-0 align-self-center">
        <h6 className="mb-0">Eliza Williams</h6>
      </Col>
    </Row>
  );
}

export default ChatUserStatus;
