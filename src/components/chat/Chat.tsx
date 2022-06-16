import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import ChatInput from './ChatInput';
import { ChatProps } from './ChatProps';
import ChatMessage from './ChatMessage';
import ChatOptions from './ChatOptions';
import ChatTimestamp from './ChatTimestamp';
import ChatUserStatus from './ChatUserStatus';

const StyledChatContainer = styled(Card)`
height: calc(100vh - 30vh);
`;

function Chat({ messages }: ChatProps) {
  return (
    <StyledChatContainer className="bg-dark rounded-3">
      <Card.Header className="border-bottom border-opacity-25 border-secondary">
        <Row className="align-items-center">
          <Col xs={11}>
            <ChatUserStatus />
          </Col>
          <Col xs={1}>
            <ChatOptions />
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="overflow-auto">
        <ChatTimestamp />
        <ChatMessage messages={messages} />
      </Card.Body>
      <Card.Footer className="text-muted border-top-0 mx-3">
        <ChatInput />
      </Card.Footer>
    </StyledChatContainer>
  );
}

export default Chat;
