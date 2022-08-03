import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Form, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';
import { ChatProps } from './ChatProps';

const StyledChatInputGroup = styled(InputGroup)`
  .form-control {
    border-radius: 1.875rem;
    border-bottom-right-radius: 0rem;
    border-top-right-radius: 0rem;
  }
  .input-group-text {
    background-color: rgb(31, 31, 31);
    border-color: #3a3b46;
    border-radius: 1.875rem;
    padding: 0.75rem !important;
    .fa-camera {
      width: 1.508rem;
      height: 1.5rem;
    }
    .fa-paper-plane {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
`;

function ChatInput({ showCamera, inputClassName }: ChatProps) {
  return (
    <StyledChatInputGroup className="mb-3 pe-2">
      {showCamera && (
        <InputGroup.Text className="border-end-0">
          <FontAwesomeIcon role="button" icon={solid('camera')} className="ps-3 text-white border-end-0" />
        </InputGroup.Text>
      )}
      <Form.Control
        placeholder="Type your message here..."
        className={`border-end-0 fs-5 ${inputClassName}`}
      />
      <InputGroup.Text className="border-start-0">
        <FontAwesomeIcon role="button" icon={solid('paper-plane')} className="text-primary pe-3" />
      </InputGroup.Text>
    </StyledChatInputGroup>
  );
}

export default ChatInput;
