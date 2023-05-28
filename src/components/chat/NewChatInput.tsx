import React, { useRef, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import styled from 'styled-components';
import { TextareaAutosize } from '@mui/material';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isMobile } from '../../constants';

interface Props {
  onSubmit: (message: string, files: File[], fileDescriptions: string[]) => Promise<void>;
  onFocus: () => void;
  onBlur: () => void;
  placeholder: string;
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
  onSubmit, onFocus, onBlur, placeholder,
}: Props) {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputElementRef = useRef<HTMLInputElement>(null);

  const clearMessageAndImages = () => {
    setMessage('');
    setSelectedFiles([]);
    fileInputElementRef.current!.value = ''; // clear out the input value
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    // Prevent out-of-order sending by disallowing sending another message until the current one
    // has finished sending.
    if (sending) { return; }

    // Keep keyboard focus on textarea after submission,
    // so the user can immediately start typing another message
    textareaRef.current?.focus();

    const trimmedMessage = message.trim(); // trim leading and trailing whitespace
    if (trimmedMessage.length > 0 || selectedFiles.length > 0) {
      setSending(true);
      try {
        await onSubmit(trimmedMessage, selectedFiles, selectedFiles.map(() => ''));
        clearMessageAndImages();
      } finally {
        setSending(false);
      }
    }
  };

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isMobile && event.key === 'Enter' && !event.shiftKey) {
      handleSubmit(event);
    }
  };

  return (
    <StyledChatInputGroup className={`bg-dark rounded-5 py-2 px-3 ${isFocused ? 'focused' : ''}`}>
      <Form onSubmit={handleSubmit} className="d-flex align-items-end">
        <div className="pe-2">
          <Button type="button" variant="link" aria-label="submit" className="d-none upload-button">
            <FontAwesomeIcon icon={solid('camera')} size="lg" />
          </Button>

          <label htmlFor="chat-file-upload-input" className="btn btn-link emoji-button">
            <FontAwesomeIcon icon={solid('camera')} size="lg" />
            <input
              id="chat-file-upload-input"
              className="d-none"
              ref={fileInputElementRef}
              type="file"
              name="files"
              accept="image/*"
              onChange={
                (e) => { setSelectedFiles(Array.from(e.target.files as Iterable<File>)); }
              }
              multiple
            />
          </label>
        </div>
        { /* TODO: Un-hide emoji icon when this feature should be enabled */}
        <div className="pe-3 d-none">
          <Button type="button" variant="link" aria-label="submit" className="emoji-button">
            <FontAwesomeIcon icon={solid('smile')} size="lg" />
          </Button>
        </div>
        <TextareaAutosize
          ref={textareaRef}
          maxRows={4}
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => { onFocus(); setIsFocused(true); }}
          onBlur={() => { onBlur(); setIsFocused(false); }}
          onKeyDown={handleTextareaKeyDown}
        />
        <div className="ps-3">
          <Button
            type="submit"
            variant="link"
            aria-label="submit"
            className="submit-button"
          >
            {
              sending
                ? <Spinner animation="border" role="status" size="sm"><span className="visually-hidden">Loading...</span></Spinner>
                : <FontAwesomeIcon icon={solid('paper-plane')} className="text-primary" size="lg" />
            }
          </Button>
        </div>
      </Form>
    </StyledChatInputGroup>
  );
}

export default ChatInput;
