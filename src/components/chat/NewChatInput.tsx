import React, { useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import styled from 'styled-components';
import { TextareaAutosize } from '@mui/material';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  onSubmit: (message: string, files: File[]) => void
}

const StyledChatInputGroup = styled.div`
  border: 1px solid var(--stroke-and-line-separator-color);

  &.focused {
    box-shadow: 0 0 0 1px var(--stroke-and-line-separator-color);
    border-radius: 24px !important;
  }

  textarea {
    background: transparent;
    color: inherit;
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
    width: 100%;
    padding: 0;
  }

  .submit-button, .upload-button, .emoji-button {
    padding: .5em;
    margin: -.5em;
  }
`;

function ChatInput({
  onSubmit,
}: Props) {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>();
  const inputFile = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    textareaRef.current?.focus(); // so that keyboard remains open click of "send-icon"
    onSubmit(message, []);
  };

  return (
    <StyledChatInputGroup className={`bg-dark rounded-5 py-2 px-3 ${isFocused ? 'focused' : ''}`}>
      <Form onSubmit={handleSubmit} className="d-flex align-items-end">
        <div className="pe-2">
          <Button type="button" variant="link" aria-label="submit" className="upload-button">
            <FontAwesomeIcon icon={solid('camera')} size="lg" />
          </Button>
        </div>
        <div className="pe-3">
          <Button type="button" variant="link" aria-label="submit" className="emoji-button">
            <FontAwesomeIcon icon={solid('smile')} size="lg" />
          </Button>
        </div>
        <TextareaAutosize
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <div className="ps-3">
          <Button type="submit" variant="link" aria-label="submit" className="submit-button">
            <FontAwesomeIcon icon={solid('paper-plane')} className="text-primary" style={{ fontSize: '22px' }} />
          </Button>
        </div>
      </Form>
    </StyledChatInputGroup>
  );
}

export default ChatInput;
