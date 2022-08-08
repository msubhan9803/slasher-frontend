import React from 'react';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import ChatInput from './ChatInput';
import { ChatProps } from './ChatProps';
import ChatMessage from './ChatMessage';
import ChatOptions from './ChatOptions';
import ChatTimestamp from './ChatTimestamp';
import ChatUserStatus from './ChatUserStatus';

// const StyledChatContainer = styled.div`
//   height: calc(100vh - 30vh);

//   @media (max-width: 37.5rem) {
//     height: calc(100vh - 15vh);
//   }
//   * {
//     /* Foreground, Background */
//     scrollbar-color: rgba(255, 255, 255, .33) rgba(255, 255, 255, .1);
//   }
//   *::-webkit-scrollbar {
//     width: 0.625rem; /* Mostly for vertical scrollbars */
//     height: 0.625rem; /* Mostly for horizontal scrollbars */
//   }
//   *::-webkit-scrollbar-thumb { /* Foreground */
//     background: rgba(255, 255, 255, .33);
//   }
//   *::-webkit-scrollbar-track { /* Background */
//     background: rgba(255, 255, 255, .1);
//   }
// `;
const StyledChatContainer = styled.div`
  height: calc(100% - 25rem);
  .card {
    height: 100%;
    .card-header {
      z-index: 1;
    }
    .card-body {
      height: calc(100% - 12px);
      z-index: 0;
      .conversation-container {
        height: calc(100% - 85px);
        overflow-x: hidden;
      }
      &::-webkit-scrollbar {
        transition: all .5s;
        width: 5px;
        height: 1px;
        z-index: 10;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: #b3ada7;
      }
      @media (max-width: 992px) {
        height: calc(100vh - 165px);
        .conversation-container {
          height: calc(100vh - 242px);
        }
      }
    }
  }
  @media (max-width: 992px) {
    height: 100% !important;
  }
`;

function Chat({
  messages, showCamera, inputClassName, conversationType,
}: ChatProps) {
  return (
    <StyledChatContainer>
      <Card className="bg-dark bg-mobile-transparent rounded-3 border-0">
        <Card.Header className="d-flex justify-content-between position-relative border-bottom border-opacity-25 border-secondary px-0 px-lg-4 py-lg-4">
          <ChatUserStatus />
          <ChatOptions />
        </Card.Header>
        <Card.Body className="position-relative overflow-auto p-0">
          <div className="conversation-container">
            <ChatTimestamp />
            <ChatMessage messages={messages} conversationType={conversationType} />
          </div>
          <ChatInput showCamera={showCamera} inputClassName={inputClassName} />
        </Card.Body>
        {/* <Card.Footer className="px-0 px-lg-4 text-muted border-top-0">
        </Card.Footer> */}
      </Card>
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
