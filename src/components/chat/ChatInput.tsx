import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Form, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';

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

function ChatInput() {
  return (
    <StyledChatInputGroup className="mb-3">
      <Form.Control
        placeholder="Type your message here..."
        className="border-end-0"
      />
      <InputGroup.Text>
        <FontAwesomeIcon role="button" icon={regular('paper-plane')} size="2x" className="text-primary pe-4" />
      </InputGroup.Text>
    </StyledChatInputGroup>
  );
}

export default ChatInput;
