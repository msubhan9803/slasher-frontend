import { DateTime } from 'luxon';
import React from 'react';
import styled from 'styled-components';
import { enableDevFeatures } from '../../utils/configEnvironment';
import ChatMessageText from './ChatMessageText';
import ChatTimestamp from './ChatTimestamp';
import { Message } from '../../types';
import { DEFAULT_USER_UPLOADED_CONTENT_ALT_TEXT } from '../../constants';

interface Props {
  messages: Message[];
  viewerUserId: string;
  onImageLoad: () => void;
}

interface MessageProps {
  message: Message;
  createdByViewer: boolean;
  onImageLoad: () => void;
}

const StyledChatMessage = styled.div`
  &.self-message {
    align-self: flex-end !important;
    .message-bubble {
      border-radius: 1.25rem;
      border-bottom-right-radius: 0rem;
      background: linear-gradient(90deg, #5C258D 2%, #4389A2 100%), var(--bs-secondary);
    }
  }

  &.other-message {
    align-self: flex-start !important;
    .message-bubble {
        background-color: #1F1F1F;
        border-radius: 1.25rem;
        border-bottom-left-radius: 0rem;
    }
  }
`;

function UserChatMessage({ message, createdByViewer, onImageLoad }: MessageProps) {
  return (
    <StyledChatMessage className={`mb-3 ${createdByViewer ? 'self-message' : 'other-message'}`}>
      {
        message.image
          ? (
            <div className="message-image p-3">
              <img
                className="w-50 rounded-3"
                src={message.image}
                alt={message.imageDescription || DEFAULT_USER_UPLOADED_CONTENT_ALT_TEXT}
                onLoad={onImageLoad}
              />
            </div>
          )
          : (
            <div className="message-bubble p-3 text-break"><ChatMessageText message={message.message} /></div>
          )
      }
      {
        enableDevFeatures && !createdByViewer && (<div className="report-message mt-1 fs-6">Report message</div>)
      }
    </StyledChatMessage>
  );
}

function ChatMessages({
  messages, viewerUserId, onImageLoad,
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
