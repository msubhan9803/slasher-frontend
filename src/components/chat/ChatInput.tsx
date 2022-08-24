import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Form, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';

const StyledChatInputGroup = styled.div`
  .input-group{
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
  }  
`;

function ChatInput() {
  return (
    <StyledChatInputGroup className="pt-4 pt-lg-3 pb-0 pb-lg-3 px-3 text-muted border-top-0 overflow-hidden">
      <InputGroup className="pe-2">
        <InputGroup.Text className="border-end-0">
          <FontAwesomeIcon role="button" icon={solid('camera')} className="ps-1 text-white border-end-0" />
        </InputGroup.Text>
        <Form.Control
          placeholder="Type your message here..."
          className="border-end-0 fs-5 border-start-0"
        />
        <InputGroup.Text className="border-start-0">
          <FontAwesomeIcon role="button" icon={solid('paper-plane')} className="text-primary pe-1" />
        </InputGroup.Text>

      </InputGroup>
    </StyledChatInputGroup>
  );
}

export default ChatInput;
