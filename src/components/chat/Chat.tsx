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

  * {
    /* Foreground, Background */
    scrollbar-color: rgba(255, 255, 255, .33) rgba(255, 255, 255, .1);
  }
  *::-webkit-scrollbar {
    width: 10px; /* Mostly for vertical scrollbars */
    height: 10px; /* Mostly for horizontal scrollbars */
  }
  *::-webkit-scrollbar-thumb { /* Foreground */
    background: rgba(255, 255, 255, .33);
  }
  *::-webkit-scrollbar-track { /* Background */
    background: rgba(255, 255, 255, .1);
  }
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
      <Card.Footer className="text-muted border-top-0 px-3">
        <ChatInput />
      </Card.Footer>
    </StyledChatContainer>
  );
}

export default Chat;
