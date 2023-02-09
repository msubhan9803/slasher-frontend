import React from 'react';
import {
  Card, Col, Image,
} from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import ChatInput from './ChatInput';
import { ChatProps } from './ChatProps';
import ChatMessage from './ChatMessage';
import ChatOptions from './ChatOptions';
import ChatUserStatus from './ChatUserStatus';
import { LG_MEDIA_BREAKPOINT } from '../../constants';

interface Props {
  height: number;
}

const StyledChatContainer = styled.div<Props>`
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
        height: ${(props) => (props.height ? 'calc(100vh - 500px)' : 'calc(100vh - 355px)')};
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
        height: calc(100vh - 165px);
        .conversation-container {
          height: ${(props) => (props.height ? 'calc(100vh - 372px)' : 'calc(100vh - 235px)')};
        }
      }
    }
  }
  @media (max-width: 991px) {
    height: 100% !important;
  }
`;

const PostImageContainer = styled.div`
  width: 7.25rem;
  height: 7.25rem;
  border: 0.125rem solid #3A3B46
`;

function Chat({
  messages, userData, sendMessageClick, setMessage, message, handleFileChange, handleRemoveFile,
  imageArray, messageLoading,
}: ChatProps) {
  return (
    <StyledChatContainer height={imageArray && imageArray.length ? 1 : 0}>
      <Card className="bg-dark bg-mobile-transparent rounded-3 border-0">
        <Card.Header className="d-flex justify-content-between position-relative border-bottom border-opacity-25 border-secondary px-0 px-lg-3 py-lg-4">
          <ChatUserStatus userData={userData} />
          <ChatOptions userData={userData} />
        </Card.Header>
        <Card.Body className="position-relative overflow-auto p-0">
          <div className="conversation-container">
            <ChatMessage messages={messages} messageLoading={messageLoading} />
          </div>
          <ChatInput
            sendMessageClick={sendMessageClick}
            setMessage={setMessage}
            message={message}
            handleFileChange={handleFileChange}
          />
          <div className="d-flex px-3 gap-3">
            {imageArray!.map((post: File) => (
              <Col xs="auto" key={post.name} className="mb-1">
                <PostImageContainer className="mt-4 position-relative d-flex justify-content-center align-items-center rounded border-0">
                  <Image
                    src={URL.createObjectURL(post)}
                    alt="Dating profile photograph"
                    className="w-100 h-100 img-fluid rounded"
                  />
                  <FontAwesomeIcon
                    icon={solid('times')}
                    size="xs"
                    role="button"
                    className="position-absolute bg-white text-primary rounded-circle"
                    style={{
                      padding: '0.313rem 0.438rem',
                      top: '6.313rem',
                      left: '6.313rem',
                    }}
                    onClick={() => handleRemoveFile!(post)}
                  />
                </PostImageContainer>
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
