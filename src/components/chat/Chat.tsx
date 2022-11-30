import React from 'react';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import ChatInput from './ChatInput';
import { ChatProps } from './ChatProps';
import ChatMessage from './ChatMessage';
import ChatOptions from './ChatOptions';
import ChatTimestamp from './ChatTimestamp';
import ChatUserStatus from './ChatUserStatus';

const StyledChatContainer = styled.div`
  height: calc(100vh - 170px);
  .card {
    height: 100%;
    .card-header {
      z-index: 1;
    }
    .card-body {
      height: calc(100vh - 165px);
      z-index: 0;
      .conversation-container {
        height: calc(100vh - 355px);
        overflow-x: hidden;
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
      @media (max-width: 992px) {
        height: calc(100vh - 165px);
        .conversation-container {
          height: calc(100vh - 235px);
        }
      }
    }
  }
  @media (max-width: 991px) {
    height: 100% !important;
  }
`;

function Chat({
  messages, userData, sendMessageClick, setMessage, message,
}: ChatProps) {
  return (
    <StyledChatContainer>
      <Card className="bg-dark bg-mobile-transparent rounded-3 border-0">
        <Card.Header className="d-flex justify-content-between position-relative border-bottom border-opacity-25 border-secondary px-0 px-lg-3 py-lg-4">
          <ChatUserStatus userData={userData} />
          <ChatOptions />
        </Card.Header>
        <Card.Body className="position-relative overflow-auto p-0">
          <div className="conversation-container">
            <ChatTimestamp />
            <ChatMessage messages={messages} />
          </div>
          <ChatInput
            sendMessageClick={sendMessageClick}
            setMessage={setMessage}
            message={message}
          />
        </Card.Body>
      </Card>
    </StyledChatContainer>
  );
}

Chat.defaulProps = {
  messages: [],
  userData: {},
  sendMessageClick: null,
  setMessage: null,
  message: null,
};

export default Chat;
