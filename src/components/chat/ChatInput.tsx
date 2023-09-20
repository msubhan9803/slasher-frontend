/* eslint-disable max-lines */
import React, { useEffect, useRef, useState } from 'react';
import {
  Button, Form, Spinner,
} from 'react-bootstrap';
import styled from 'styled-components';
import { TextareaAutosize } from '@mui/material';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ImagesContainer from '../ui/ImagesContainer';
import ErrorMessageList from '../ui/ErrorMessageList';
import CustomEmojiPicker, { Emoji } from '../ui/Emoji/CustomEmojiPicker';
import { isMobile } from '../../utils/browser-utils';
import { isNativePlatform, maxWidthForCommentOrReplyInputOnMobile } from '../../constants';
import { onKeyboardClose, onKeyboardOpen } from '../../utils/styles-utils ';
import useWindowInnerWidth from '../../hooks/useWindowInnerWidth';

interface Props {
  onSubmit: (message: string, files: File[], fileDescriptions: string[]) => Promise<void>;
  onRemoveFile: () => void;
  onFocus: () => void;
  onBlur: () => void;
  placeholder: string;
  errorsToDisplay: string[];
  isFocused: boolean;
  setIsFocused: (val: boolean) => void;
}

const StyledChatInputGroup = styled.div`
  border: 1px solid var(--stroke-and-line-separator-color);

  &.focused {
    box-shadow: 0 0 0 1px var(--stroke-and-line-separator-color);
    border-radius: 24px !important;
  }

  .message-attachments {
    border-bottom: 1px solid var(--stroke-and-line-separator-color);
    margin: .75rem 0;
    height: 10.93rem;
    overflow-y: scroll; 
  }

  .emoji-picker-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
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

const StyledTextareaAutosize = styled(TextareaAutosize)`
  cursor: auto
`;

function ChatInput({
  onSubmit, onFocus, onBlur, onRemoveFile, placeholder, errorsToDisplay, isFocused, setIsFocused,
}: Props) {
  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputElementRef = useRef<HTMLInputElement>(null);
  const clearFileInputValue = () => {
    // Clear out the input value so that the same image can be selected again later
    fileInputElementRef.current!.value = '';
  };
  const windowInnerWidth = useWindowInnerWidth();

  useEffect(() => {
    if (isFocused) {
      onKeyboardOpen();
    } else {
      onKeyboardClose();
    }
  }, [isFocused]);

  const clearMessageAndImages = () => {
    setMessage('');
    setSelectedFiles([]);
    clearFileInputValue();
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(
      [
        ...(selectedFiles.slice(0, index)),
        ...(selectedFiles.slice(index + 1)),
      ],
    );
    setFileDescriptions(
      [
        ...(fileDescriptions.slice(0, index)),
        ...(fileDescriptions.slice(index + 1)),
      ],
    );
  };

  const updateFileDescription = (index: number, newValue: string) => {
    const newFileDescriptions = [...fileDescriptions];
    newFileDescriptions[index] = newValue;
    setFileDescriptions(newFileDescriptions);
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
    const cleanedFileDescriptions = fileDescriptions.map(
      (fileDesctiption) => (fileDesctiption ? fileDesctiption.trim() : ''),
    );
    if (trimmedMessage.length > 0 || selectedFiles.length > 0) {
      setSending(true);
      try {
        await onSubmit(trimmedMessage, selectedFiles, cleanedFileDescriptions);
        clearMessageAndImages();
      } finally {
        setSending(false);
      }
    }
  };

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (sending) {
      // If sending, do not let the user type in the input area until send is complete.
      event.preventDefault();
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey && !isMobile()) {
      handleSubmit(event);
    }
  };

  const handleEmojiSelect = (emoji: Emoji) => {
    if (!textareaRef.current) { return; }

    const input = textareaRef.current;
    const { selectionStart, value } = input;

    const startText = value.substring(0, selectionStart);
    const endText = value.substring(selectionStart);

    const newText = startText + emoji.native + endText;

    setMessage(newText);

    const newCursorPos = selectionStart + emoji.native.length;

    setTimeout(() => {
      input.value = newText;
      input.selectionStart = newCursorPos;
      input.selectionEnd = newCursorPos;
      input.focus();
    }, 0);
  };

  const closeEmojiPickerIfOpen = () => {
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
    }
  };

  const renderMessageAttachments = () => (
    <div className="message-attachments">
      <div className="message-attachment-inner m-3">
        {
          selectedFiles.map((file, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className="me-2 d-inline-block" key={`file-${index}`}>
              <ImagesContainer
                containerWidth="7.25rem"
                containerHeight="7.25rem"
                containerBorder="0.125rem solid var(--bs-input-border-color)"
                image={file}
                alt={fileDescriptions[index]}
                onAltTextChange={(newValue) => { updateFileDescription(index, newValue); }}
                handleRemoveImage={() => { removeSelectedFile(index); onRemoveFile?.(); }}
                index={index}
                containerClass="position-relative d-flex justify-content-center align-items-center rounded border-0"
                removeIconStyle={{
                  padding: '0.313rem 0.438rem',
                  top: '6.313rem',
                  left: '6.313rem',
                }}
              />
            </div>
          ))
        }
      </div>
    </div>
  );
  const handleMessage = (e: any) => {
    setMessage(e.target.value);
  };
  const handleCursorChange = () => {
    if (!textareaRef.current) { return; }
    textareaRef.current.selectionStart = textareaRef.current.selectionEnd;
  };
  return (
    <StyledChatInputGroup className={`bg-dark rounded-5 py-2 px-3 ${isFocused ? 'focused' : ''}`}>
      {
        selectedFiles.length > 0 && renderMessageAttachments()
      }
      {
        errorsToDisplay.length > 0 && <ErrorMessageList className="my-2" errorMessages={errorsToDisplay} />
      }
      <Form onSubmit={handleSubmit} className="d-flex align-items-end">
        <div className="pe-3 pe-lg-2">
          <Button
            type="button"
            variant="link"
            className="upload-button"
            onClick={(e) => { e.preventDefault(); fileInputElementRef.current?.click(); }}
          >
            <FontAwesomeIcon icon={solid('camera')} size="lg" />
            <span className="sr-only">Upload file button</span>
          </Button>
          <label htmlFor="chat-file-upload-input" className="sr-only">
            <span className="sr-only">Upload file input</span>
            <input
              id="chat-file-upload-input"
              className="d-none"
              ref={fileInputElementRef}
              type="file"
              name="files"
              accept="image/*"
              onChange={
                (e) => {
                  const newFiles = Array.from(e.target.files as Iterable<File>);
                  // Limit total number to 10
                  const newSelectedFiles = [...selectedFiles, ...newFiles].slice(0, 10);
                  setSelectedFiles(newSelectedFiles);
                  const newFileDescriptions = [...fileDescriptions];
                  // Extemd or shorten description array as needed
                  newFileDescriptions.length = newSelectedFiles.length;
                  setFileDescriptions(newFileDescriptions);
                  clearFileInputValue();
                }
              }
              multiple
            />
          </label>
        </div>
        {!isNativePlatform && (windowInnerWidth > maxWidthForCommentOrReplyInputOnMobile)
          && (
            <div className="pe-3">
              {
                showEmojiPicker && (
                  <div className="position-relative">
                    <div className="emoji-picker-wrapper">
                      <CustomEmojiPicker
                        autoFocus
                        handleEmojiSelect={handleEmojiSelect}
                        onClickOutside={closeEmojiPickerIfOpen}
                        onEscapeKeyPress={closeEmojiPickerIfOpen}
                      />
                    </div>
                  </div>
                )
              }
              <Button
                type="button"
                variant="link"
                className="emoji-button"
                onClick={
                  // NOTE: Must stop event propagation below, otherwise the emoji picker
                  // onClickOutside function will fire because it will detect a click that is
                  // technically outside of the emoji picker box area.
                  (e) => { e.preventDefault(); e.stopPropagation(); setShowEmojiPicker(true); }
                }
              >
                <span className="sr-only">Toggle emoji picker</span>
                <FontAwesomeIcon icon={solid('smile')} size="lg" />
              </Button>
            </div>
          )}
        <StyledTextareaAutosize
          ref={textareaRef}
          maxRows={4}
          placeholder={placeholder}
          value={message}
          onChange={handleMessage}
          onMouseUp={handleCursorChange}
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
