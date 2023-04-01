import React from 'react';
import {
  Card, Col,
} from 'react-bootstrap';
import styled from 'styled-components';
import ChatInput from './ChatInput';
import { ChatProps } from './ChatProps';
import ChatMessage from './ChatMessage';
import ChatOptions from './ChatOptions';
import ChatUserStatus from './ChatUserStatus';
import { LG_MEDIA_BREAKPOINT } from '../../constants';
import ImagesContainer from '../ui/ImagesContainer';

interface Props {
  height: number;
}

const StyledChatContainer = styled.div<Props>`
  height: calc(100dvh - 111px);
  .card {
    height: 100%;
    .card-header {
      z-index: 1;
    }
    .card-body {
      height: calc(100dvh - 145px);
      z-index: 0;
      .conversation-container {
        height: ${(props) => (props.height ? 'calc(100dvh - 440px)' : 'calc(100dvh - 300px)')};
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
      @media (max-width: ${LG_MEDIA_BREAKPOINT}) {
        height: calc(100dvh - 165px);
        .conversation-container {
          height: ${(props) => (props.height ? 'calc(100dvh - 372px)' : 'calc(100dvh - 240px)')};
        }
      }
      .image-container {
        overflow-y: hidden !important;
      }
    }
  }
  @media (max-width: 991px) {
    height: 100% !important;
  }
`;

function Chat({
  messages, userData, sendMessageClick, setMessage, message, handleFileChange, handleRemoveFile,
  imageArray, messageLoading,
}: ChatProps) {
  return (
    <StyledChatContainer height={imageArray && imageArray.length ? 1 : 0}>
      <Card className="bg-black bg-mobile-transparent rounded-3 border-0">
        <Card.Header className="d-flex justify-content-between position-relative border-bottom border-opacity-25 border-secondary px-0 px-lg-3 py-lg-4">
          <ChatUserStatus userData={userData} />
          <ChatOptions userData={userData} />
        </Card.Header>
        <Card.Body className="position-relative overflow-visible p-0">
          <div className="conversation-container">
            <ChatMessage messages={messages} messageLoading={messageLoading} />
          </div>
          <ChatInput
            sendMessageClick={sendMessageClick}
            setMessage={setMessage}
            message={message}
            handleFileChange={handleFileChange}
          />
          <div className="image-container overflow-auto d-flex mx-4 gap-3">
            {imageArray!.map((post: File) => (
              <Col xs="auto" key={post.name} className="mb-2">
                <ImagesContainer
                  containerWidth="7.25rem"
                  containerHeight="7.25rem"
                  containerBorder="0.125rem solid var(--bs-input-border-color)"
                  image={post}
                  alt="post image"
                  handleRemoveImage={() => handleRemoveFile!(post)}
                  containerClass="position-relative d-flex justify-content-center align-items-center rounded border-0"
                  removeIconStyle={{
                    padding: '0.313rem 0.438rem',
                    top: '6.313rem',
                    left: '6.313rem',
                  }}
                />
              </Col>
            ))}
          </div>
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
