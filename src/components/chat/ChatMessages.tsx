import { DateTime } from 'luxon';
import React from 'react';
import styled from 'styled-components';
import { enableDevFeatures } from '../../utils/configEnvironment';
import ChatMessageText from './ChatMessageText';
import ChatTimestamp from './ChatTimestamp';
import { Message } from '../../types';
import { DEFAULT_USER_UPLOADED_CONTENT_ALT_TEXT } from '../../constants';
import ZoomableImage from '../ui/ZoomableImage';

interface Props {
  messages: Message[];
  viewerUserId: string;
  maxChatImageHeight: number;
  onImageLoad: () => void;
}

interface MessageProps {
  message: Message;
  createdByViewer: boolean;
  maxChatImageHeight: number;
  onImageLoad: () => void;
}

const StyledChatMessage = styled.div`
  &.self-message {
    text-align: right;

    .message-bubble {
      border-radius: 1.25rem;
      border-bottom-right-radius: 0rem;
      background: linear-gradient(90deg, #5C258D 2%, #4389A2 100%), var(--bs-secondary);
    }
  }

  &.other-message {
    .message-bubble {
        background-color: #1F1F1F;
        border-radius: 1.25rem;
        border-bottom-left-radius: 0rem;
    }
  }

  .message-content {
    display: inline-block;
    max-width: 50%;
  }
`;

function UserChatMessage({
  message, createdByViewer, maxChatImageHeight, onImageLoad,
}: MessageProps) {
  return (
    <StyledChatMessage className={`mb-3 ${createdByViewer ? 'self-message' : 'other-message'}`}>
      <div className="message-content">
        {
          message.urls.length > 0
            ? (
              <div className="message-image">
                <ZoomableImage
                  containerClassName="w-100"
                  imgClassName="w-100 rounded-3"
                  imgStyle={{ maxHeight: `${maxChatImageHeight}px` }}
                  // There should only ever be one url in `urls`
                  src={message.urls[0]}
                  // TODO: When old API is retired, we can switch to using `image` instead of `urls`
                  // src={message.image}
                  alt={message.imageDescription || DEFAULT_USER_UPLOADED_CONTENT_ALT_TEXT}
                  onLoad={onImageLoad}
                />
              </div>
            )
            : (
              <div className="message-bubble d-inline-block p-3 text-break"><ChatMessageText message={message.message} /></div>
            )
        }
        <div className="mt-1 fs-6">
          {DateTime.fromISO(message.createdAt).toFormat('h:mm a')}
          {enableDevFeatures && !createdByViewer && (<> &bull; Report message</>)}
        </div>
      </div>
    </StyledChatMessage>
  );
}

function ChatMessages({
  messages, viewerUserId, maxChatImageHeight, onImageLoad,
}: Props) {
  const renderMessage = (message: Message, previousMessage?: Message) => {
    if (message.fromId === viewerUserId) { <div>{message.message}</div>; }
    let insertTimestamp = false;

    if (previousMessage) {
      const messageDateString = DateTime.fromISO(message.createdAt).toISODate();
      const previousMessageDateString = DateTime.fromISO(previousMessage.createdAt).toISODate();
      insertTimestamp = messageDateString !== previousMessageDateString;
    }

    return (
      <React.Fragment key={`fragment-for-${message._id}`}>
        {insertTimestamp && <ChatTimestamp key={`${message._id}-timestamp`} messageTime={message.createdAt} />}
        <UserChatMessage
          maxChatImageHeight={maxChatImageHeight}
          key={`message-${message._id}`}
          message={message}
          createdByViewer={message.fromId === viewerUserId}
          onImageLoad={onImageLoad}
        />
      </React.Fragment>
    );
  };

  return (
    <div className="d-flex flex-column pt-2 pe-3">
      {
        messages?.map(
          (message, index) => renderMessage(message, index > 0 ? messages[index - 1] : undefined),
        )
      }
    </div>
  );
}

export default ChatMessages;
