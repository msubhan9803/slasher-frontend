import React, { useEffect, useRef } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DateTime } from 'luxon';
import styled from 'styled-components';
import { ChatProps } from './ChatProps';

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

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView(
        {
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest',
        },
      );
    }
  });

  const renderMessage = (message: any) => (message.participant === 'other' ? (
    <div key={message.id} className="other-message mb-3">
      <div className="mb-2 d-flex">
        <p className="fs-4 mb-0 p-3 text-small">
          {message.message}
        </p>
      </div>
      <span className="fs-6 time-stamp align-items-center d-flex">
        {DateTime.fromISO(message.time).toFormat('h:mm a')}
        <FontAwesomeIcon icon={solid('circle')} size="sm" className="mx-2" />
        Report message
      </span>
    </div>
  ) : (
    <div key={message.id} className="self-message align-items-end d-flex flex-column mb-3">
      <div className="mb-2">
        <p className="fs-4 mb-0 p-3 text-small text-white">
          {message.message}
        </p>
      </div>
      <span className="time-stamp fs-6">{DateTime.fromISO(message.time).toFormat('h:mm a')}</span>
    </div>
  ));

  let lastTimeStampMessage = '';
  return (
    <ChatMessages className="px-3" ref={messageRef}>
      {messages?.map((message) => {
        // console.log('lastTimeStampMessage =', lastTimeStampMessage);
        // console.log('message.time =', message.time);
        if (!lastTimeStampMessage) {
          if (DateTime.fromISO(lastTimeStampMessage).diff(DateTime.fromISO(message.time)).as('years') > 1) {
            console.log('year =', DateTime.fromISO(message.time).toLocaleString({
              month: 'short',
              weekday: 'long',
              day: 'numeric',
              year: 'numeric',
            }));
          } else if (DateTime.fromISO(lastTimeStampMessage).diff(DateTime.fromISO(message.time)).as('hours') > 48) {
            console.log('hour = ', DateTime.fromISO(message.time).toLocaleString({ month: 'short', weekday: 'long', day: 'numeric' }));
          } else {
            console.log(DateTime.fromISO(message.time).toLocaleString({ weekday: 'long' }));
          }
        }
        lastTimeStampMessage = message.time;
        return renderMessage(message);
      })}
    </ChatMessages>
  );
}

export default ChatMessage;
