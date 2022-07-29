import React from 'react';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import ChatInput from './ChatInput';
import { ChatProps } from './ChatProps';
import ChatMessage from './ChatMessage';
import ChatOptions from './ChatOptions';
import ChatTimestamp from './ChatTimestamp';
import ChatUserStatus from './ChatUserStatus';

const StyledChatContainer = styled(Card)`
  height: calc(100vh - 30vh);

  @media (max-width: 37.5rem) {
    height: calc(100vh - 15vh);

    .card-footer {
      padding-right: 2.063rem;
      padding-left: 1.5rem;
    }
  }
  * {
    /* Foreground, Background */
    scrollbar-color: rgba(255, 255, 255, .33) rgba(255, 255, 255, .1);
  }
  *::-webkit-scrollbar {
    width: 0.625rem; /* Mostly for vertical scrollbars */
    height: 0.625rem; /* Mostly for horizontal scrollbars */
  }
  *::-webkit-scrollbar-thumb { /* Foreground */
    background: rgba(255, 255, 255, .33);
  }
  *::-webkit-scrollbar-track { /* Background */
    background: rgba(255, 255, 255, .1);
  }
`;

function Chat({
  messages, showCamera, inputClassName, conversationType,
}: ChatProps) {
  return (
    <StyledChatContainer className="bg-dark bg-mobile-transparent rounded-3">
      <Card.Header className="border-bottom border-opacity-25 border-secondary px-0 px-lg-4 py-4 pt-5 pt-lg-4">
        <div className="d-flex justify-content-between">
          <ChatUserStatus />
          <ChatOptions />
        </div>
      </Card.Header>
      <Card.Body className="overflow-auto px-0 px-lg-4">
        <ChatTimestamp />
        <ChatMessage messages={messages} conversationType={conversationType} />
      </Card.Body>
      <Card.Footer className="p-0 text-muted border-top-0">
        <ChatInput showCamera={showCamera} inputClassName={inputClassName} />
      </Card.Footer>
    </StyledChatContainer>
  );
}

Chat.defaulProps = {
  messages: [],
  showCamera: false,
  inputClassName: '',
  conversationType: '',
};

export default Chat;
