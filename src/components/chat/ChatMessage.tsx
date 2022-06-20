import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container } from 'react-bootstrap';
import styled from 'styled-components';
import { ChatProps } from './ChatProps';

const ChatMessages = styled(Container)`
.other-message { 
  p {
      background-color: #1F1F1F;
      border-radius: 1.25rem;
      border-bottom-left-radius: 0rem;
  }
  .fa-circle {
    width: 0.313rem;
    color: #3A3B46;
  }
}
.self-message { 
  p {
    border-radius: 1.25rem;
    border-bottom-right-radius: 0rem;
    background: linear-gradient(266.51deg, #3457D5 4.43%,  rgba(52, 87, 213, 0.7) 52.02%, #3457D5 100%), #000000;
  }
}
`;

function ChatMessage({ messages }: ChatProps) {
  return (
    <ChatMessages>
      {messages.map((message) => (message.participant === 'other' ? (
        <div key={message.id} className="other-message mb-3">
          <div className="mb-2 d-flex">
            <p className="mb-0 p-3 text-muted text-small">
              {message.message}
            </p>
          </div>
          <span className="align-items-center d-flex small text-muted">
            {message.time}
          </span>
        </div>
      ) : (
        <div key={message.id} className="self-message align-items-end d-flex flex-column mb-3">
          <div className="mb-2">
            <p className="mb-0 p-3 text-small text-white">
              {message.message}
            </p>
          </div>
          <span className="small text-muted">{message.time}</span>
        </div>
      )))}
    </ChatMessages>
  );
}

export default ChatMessage;
