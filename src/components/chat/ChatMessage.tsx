import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';
import { ChatProps } from './ChatProps';

const ChatMessages = styled.div<ChatProps>`
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
      background: ${(data) => (data.conversationType === 'dating' ? 'linear-gradient(266.51deg, #3457D5 4.43%, rgba(52, 87, 213, 0.7) 52.02%, #3457D5 100%), #000000;' : 'linear-gradient(90deg, #5C258D 2%, #4389A2 100%), #000000')};
    }
  }
`;

function ChatMessage({ messages, conversationType }: ChatProps) {
  return (
    <ChatMessages conversationType={conversationType} className="px-lg-4 pe-3">
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
