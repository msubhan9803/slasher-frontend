import React, { ChangeEvent, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Button, Form, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';

const StyledChatInputGroup = styled.div`
  .btn{
    z-index: 999;
    &.camera-btn{
      left: 12px;
      .fa-camera {
        width: 1.508rem;
        height: 1.5rem;
      }
    }
    &.send-btn{
      right: 15px;
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
        <InputGroup className="pe-2 align-items-center position-relative">
          <Button onClick={() => inputFile.current?.click()} className="camera-btn position-absolute position-absolute bg-transparent border-0 p-0 me-1">
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
            <FontAwesomeIcon icon={solid('camera')} className="text-white" />
          </Button>
          <Form.Control
            placeholder="Type your message here..."
            className="fs-5 rounded-pill pe-5 py-3"
            value={message}
            onChange={
              (messageInput) => setMessage!(messageInput.target.value)
            }
            aria-label="message"
            style={{ paddingLeft: '60px' }}
          />
          <Button type="submit" className="send-btn position-absolute bg-transparent border-0 p-0 me-2">
            <FontAwesomeIcon icon={solid('paper-plane')} className="text-primary" />
          </Button>
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
