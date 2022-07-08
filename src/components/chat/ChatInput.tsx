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
  }
  svg {
    color: var(--bs-primary);
    min-width: 1.875rem;
  }
`;

function ChatInput({ showCamera, inputClassName }: ChatProps) {
  return (
    <StyledChatInputGroup className="mb-3">
      {showCamera && (
        <InputGroup.Text>
          <FontAwesomeIcon role="button" icon={solid('camera')} size="2x" className="ps-3 text-white border-end-0" />
        </InputGroup.Text>
      )}
      <Form.Control
        placeholder="Type your message here..."
        className={`border-end-0 ${inputClassName}`}
      />
      <InputGroup.Text>
        <FontAwesomeIcon role="button" icon={solid('paper-plane')} size="2x" className="text-primary pe-3" />
      </InputGroup.Text>
    </StyledChatInputGroup>
  );
}

export default ChatInput;
