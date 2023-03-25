import React, { ChangeEvent, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Button, Form, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';

const StyledChatInputGroup = styled.div`
  .input-group{
    .form-control {
      border-radius: 1.875rem;
      border-bottom-right-radius: 0rem;
      border-top-right-radius: 0rem;
    }
    .input-group-text {
      background-color: var(--bs-dark);
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

interface ChatInputProps {
  sendMessageClick?: () => void;
  setMessage?: (value: string) => void;
  message?: string;
  handleFileChange?: (value: ChangeEvent<HTMLInputElement>) => void;
}

function ChatInput({
  sendMessageClick, setMessage, message, handleFileChange,
}: ChatInputProps) {
  const inputFile = useRef<HTMLInputElement>(null);
  const handleSubmit = (event: any) => {
    event.preventDefault();
    sendMessageClick!();
  };
  return (
    <StyledChatInputGroup className="pt-4 pt-lg-3 pb-0 pb-lg-3 px-3 text-muted border-top-0 overflow-hidden">
      <Form onSubmit={handleSubmit}>
        <InputGroup className="pe-2">
          <InputGroup.Text className="border-end-0">
            <input
              type="file"
              name="post"
              className="d-none"
              accept="image/*"
              onChange={(post) => {
                handleFileChange!(post);
              }}
              multiple
              ref={inputFile}
              aria-label="message"
            />
            <FontAwesomeIcon role="button" icon={solid('camera')} className="ps-1 text-white border-end-0" onClick={() => inputFile.current?.click()} />
          </InputGroup.Text>
          <Form.Control
            placeholder="Type your message here..."
            className="border-end-0 fs-5 border-start-0"
            value={message}
            onChange={
              (messageInput) => setMessage!(messageInput.target.value)
            }
            aria-label="message"
          />
          <InputGroup.Text className="border-start-0">
            <Button type="submit" className="bg-transparent border-0 p-0 pe-1">
              <FontAwesomeIcon icon={solid('paper-plane')} className="text-primary" />
            </Button>
          </InputGroup.Text>
        </InputGroup>
      </Form>
    </StyledChatInputGroup>
  );
}

ChatInput.defaultProps = {
  sendMessageClick: null,
  setMessage: null,
  message: null,
  handleFileChange: null,
};

export default ChatInput;
