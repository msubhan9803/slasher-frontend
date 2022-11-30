import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef } from 'react';
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

  return (
    <ChatMessages className="px-3" ref={messageRef}>
      {messages?.map((message) => (message.participant === 'other' ? (
        <div key={message.id} className="other-message mb-3">
          <div className="mb-2 d-flex">
            <p className="fs-4 mb-0 p-3 text-small">
              {message.message}
            </p>
          </div>
          <span className="fs-6 time-stamp align-items-center d-flex">
            {message.time}
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
          <span className="time-stamp fs-6">{message.time}</span>
        </div>
      )))}
    </ChatMessages>
  );
}

export default ChatMessage;
