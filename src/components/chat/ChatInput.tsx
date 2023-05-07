import React, {
  ChangeEvent, useEffect, useRef, useState,
} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Button, Form, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { setKeyboardOpen } from '../../redux/slices/userSlice';

interface InputProps {
  focus: boolean;
}

const StyledChatInputGroup = styled(InputGroup) <InputProps>`
  .input-group-text {
    background-color: var(--bs-dark);
    border-color: #3a3b46;
    border-radius: 24px !important;
    z-index: 999;
    &.camera-btn{
      border-bottom-right-radius: 0rem !important;
      border-top-right-radius: 0rem !important;
      div{
        left: 12px;
        .fa-camera {
          width: 1.508rem;
          height: 1.5rem;
        }
      }
    }
    &.send-btn{
      border-bottom-left-radius: 0rem !important;
      border-top-left-radius: 0rem !important;
      .btn {
        right: 12px;
        .fa-paper-plane {
          width: 1.5rem;
          height: 1.5rem;
        }
      }
    }
    svg {
      min-width: 1.875rem;
    }
  }
  
  ${(props) => props.focus && `
    box-shadow: 0 0 0 1px var(--stroke-and-line-separator-color);
    border-radius: 24px !important;
  `};

`;
interface ChatInputProps {
  sendMessageClick?: () => void;
  setMessage?: (value: string) => void;
  message?: string;
  handleFileChange?: (value: ChangeEvent<HTMLInputElement>) => void;
  rows: number;
  setRows: (value: number) => void;
  calculateRows: () => void;
  textareaRef: any;
}

function ChatInput({
  sendMessageClick, setMessage, message, handleFileChange, rows,
  setRows, calculateRows, textareaRef,
}: ChatInputProps) {
  const [isFocusInput, setIsFocusInput] = useState<boolean>(false);
  const inputFile = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // We're delaying the `isKeyboardOpen` so that wehn send button is pressed
    // we want the input to focussed again and on mobile devices we wan't the
    // keyboard to be kept open. Thus we want to clearTimeout in case when send
    // button is pressed as by default the focus of the input is lost and thus we don't
    // want to set isKeyboardOpen=true in that quick case (otherwise the keyboard will close).
    const timer = setTimeout(() => {
      dispatch(setKeyboardOpen(isFocusInput));
    }, 200);
    return () => clearTimeout(timer);
  }, [dispatch, isFocusInput]);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    textareaRef.current.focus(); // so that keyboard remains open click of "send-icon"
    sendMessageClick!();
    setRows(1);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (event.key === 'Enter' && !event.shiftKey && !isMobile) {
      handleSubmit(event);
    }
  };
  return (
    <Form onSubmit={handleSubmit}>
      <div className="d-flex align-items-end">
        <StyledChatInputGroup focus={isFocusInput} className="me-2 position-absolute">
          <InputGroup.Text className="camera-btn position-relative border-end-0">
            <div className="position-absolute align-self-end d-flex p-0">
              <FontAwesomeIcon
                onClick={() => {
                  inputFile.current?.click();
                }}
                icon={solid('camera')}
                size="lg"
                className=""
                tabIndex={0}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    inputFile.current?.click();
                  }
                }}
              />
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
                aria-label="image"
              />
            </div>
          </InputGroup.Text>
          <Form.Control
            as="textarea"
            rows={rows}
            placeholder="Type your message here..."
            className="shadow-none border-start-0 border-end-0"
            value={message}
            onChange={
              (messageInput) => setMessage!(messageInput.target.value)
            }
            aria-label="message"
            style={{ paddingLeft: '38px', resize: 'none', height: `${rows * 24}px` }}
            onFocus={() => setIsFocusInput(true)}
            onBlur={() => setIsFocusInput(false)}
            ref={textareaRef}
            onInput={calculateRows}
            onKeyDown={handleKeyDown}
          />
          <InputGroup.Text className="position-relative ps-5 border-start-0 send-btn">
            <Button type="submit" variant="link" aria-label="submit" className="position-absolute d-flex align-self-end p-0">
              <FontAwesomeIcon icon={solid('paper-plane')} style={{ fontSize: '26px' }} className="text-primary" />
            </Button>
          </InputGroup.Text>
        </StyledChatInputGroup>
      </div>
    </Form>
  );
}

ChatInput.defaultProps = {
  sendMessageClick: null,
  setMessage: null,
  message: null,
  handleFileChange: null,
};

export default ChatInput;
