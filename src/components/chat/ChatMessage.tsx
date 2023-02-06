import React, { useEffect, useRef } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DateTime } from 'luxon';
import styled from 'styled-components';
import { ChatProps } from './ChatProps';
import ChatTimestamp from './ChatTimestamp';

const ChatMessages = styled.div`
.time-stamp{
  color: #797979;
  font-size: 0.75rem;
  .fa-circle {
    width: 0.188rem;
  }
}
  .other-message {
    p {
        background-color: #1F1F1F;
        border-radius: 1.25rem;
        border-bottom-left-radius: 0rem;
    }
  }
  .self-message {
    p {
      border-radius: 1.25rem;
      border-bottom-right-radius: 0rem;
      background: linear-gradient(90deg, #5C258D 2%, #4389A2 100%), #000000;
    }
  }
`;

function ChatMessage({ messages }: ChatProps) {
  const messageRef = useRef<HTMLDivElement>(null);
  let lastTimeStampMessage = '';

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView(
        {
          behavior: 'auto',
          block: 'end',
          inline: 'nearest',
        },
      );
    }
  });

  const renderMessage = (message: any) => (
    <React.Fragment key={message.id}>
      {(!lastTimeStampMessage || DateTime.fromISO(lastTimeStampMessage).toISODate()
        !== DateTime.fromISO(message.time).toISODate())
        && <ChatTimestamp messageTime={message.time} />}
      {message.participant === 'other' ? (
        <div className="other-message mb-3">
          <div className="mb-2 d-flex">
            <p className="fs-4 mb-0 p-3 text-small">
              {decodeURIComponent(message.message)}
            </p>
          </div>
          <span className="fs-6 time-stamp align-items-center d-flex">
            {DateTime.fromISO(message.time).toFormat('h:mm a')}
            <FontAwesomeIcon icon={solid('circle')} size="sm" className="mx-2" />
            Report message
          </span>
        </div>
      ) : (
        <div className="self-message align-items-end d-flex flex-column mb-3">
          <div className="mb-2">
            <p className="fs-4 mb-0 p-3 text-small text-white">
              {decodeURIComponent(message.message)}
            </p>
          </div>
          <span className="time-stamp fs-6">{DateTime.fromISO(message.time).toFormat('h:mm a')}</span>
        </div>
      )}
    </React.Fragment>
  );

  return (
    <ChatMessages className="px-3" ref={messageRef}>
      {messages?.map((message, index) => {
        lastTimeStampMessage = index > 0 ? messages[index - 1].time : '';
        return renderMessage(message);
      })}
    </ChatMessages>
  );
}

export default ChatMessage;
