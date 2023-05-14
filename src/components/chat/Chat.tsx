import React, { useRef, useState, useEffect } from 'react';
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
  rows: number;
}

const StyledChatContainer = styled.div<Props>`
  .card {
    height: 100%;
    .card-header {
      z-index: 1;
    }
    .card-body {
      height:${(props) => ((props.height) ? 'calc(100dvh - 340px)' : 'calc(100dvh - 221px )')} ;
      z-index: 0;
      .conversation-container {
        height: ${(props) => (props.height ? `calc(100dvh - ${props.height ? '360px' : '224px'}  - ${props.rows * 24}px)` : `calc(100dvh -  236px  - ${props.rows * 24}px)`)};
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
        height: ${(props) => (props.height ? 'calc(100dvh - 278px)' : 'calc(100dvh - 170px)')};;
        .conversation-container {
          height: ${(props) => (props.height ? 'calc(100dvh - 348px)' : 'calc(100dvh - 235px)')};
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
  imageArray, messageLoading, descriptionArray, setDescriptionArray,
}: ChatProps) {
  const onChangeDescription = (newValue: string, index: number) => {
    const descriptionArrayList = [...descriptionArray!];
    descriptionArrayList![index] = newValue;
    setDescriptionArray!([...descriptionArrayList!]);
  };

  const setAltTextValue = (index: number) => {
    const altText = descriptionArray![index];
    return altText;
  };

  const textareaRef = useRef<any>(null);
  const [rows, setRows] = useState(1);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string[]>([]);

  const calculateRows = () => {
    const textareaLineHeight = 24;
    const previousRows = rows;
    textareaRef.current.rows = 1;
    const currentRows = Math.floor(textareaRef.current.scrollHeight / textareaLineHeight);
    if (currentRows === previousRows) {
      textareaRef.current.rows = currentRows;
    } else if (currentRows > 3) {
      textareaRef.current.rows = 3;
      setRows(3);
    } else {
      textareaRef.current.rows = currentRows;
      setRows(currentRows);
    }
  };
  useEffect(() => {
    if (message?.length === 0) {
      setRows(1);
    }
  }, [message]);
  const handleShowPicker = () => {
    setShowPicker(!showPicker);
  };
  return (
    <StyledChatContainer height={imageArray && imageArray.length ? 1 : 0} rows={rows}>
      <Card className="bg-black bg-mobile-transparent rounded-3 border-0">
        <Card.Header className="d-flex justify-content-between position-relative border-bottom border-opacity-25 border-secondary px-0 px-lg-3 py-lg-4">
          <ChatUserStatus userData={userData} />
          <ChatOptions userData={userData} />
        </Card.Header>
        <Card.Body className="position-relative overflow-visible p-0">
          <div className="conversation-container">
            <ChatMessage
              messages={messages}
              setMessage={setMessage}
              messageLoading={messageLoading}
              showPicker={showPicker}
              selectedEmoji={selectedEmoji}
              setSelectedEmoji={setSelectedEmoji}
            />
          </div>
        </Card.Body>
        <ChatInput
          sendMessageClick={sendMessageClick}
          setMessage={setMessage}
          message={message}
          handleFileChange={handleFileChange}
          rows={rows}
          setRows={setRows}
          calculateRows={calculateRows}
          textareaRef={textareaRef}
          onEmojiClick={handleShowPicker}
          setShowPicker={setShowPicker}
          setSelectedEmoji={setSelectedEmoji}
        />
        <div className="image-container overflow-auto d-flex mx-4 gap-3 mt-3">
          {imageArray!.map((post: File, index: number) => (
            <Col xs="auto" key={post.name} className="mb-2">
              <ImagesContainer
                containerWidth="7.25rem"
                containerHeight="7.25rem"
                containerBorder="0.125rem solid var(--bs-input-border-color)"
                image={post}
                alt={setAltTextValue(index)}
                onAltTextChange={(newValue) => { onChangeDescription(newValue, index); }}
                handleRemoveImage={() => handleRemoveFile!(post, index)}
                index={index}
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
