/* eslint-disable max-lines */
import React, {
  createRef, useCallback, useEffect, useRef, useState,
} from 'react';
import Mentions from 'rc-mentions';
import { OptionProps } from 'rc-mentions/lib/Option';
import { MentionsRef } from 'rc-mentions/lib/Mentions';
import styled from 'styled-components';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import UserCircleImage from './UserCircleImage';
import CustomEmojiPicker from './Emoji/CustomEmojiPicker';
import { isNativePlatform } from '../../constants';

interface SytledMentionProps {
  iscommentinput: string;
}
interface PickerProp {
  createpost: any;
  emojiPickerTop: boolean;
}

interface StyledShadowWrapperProps {
  isMentionsFocused: boolean;
  iscommentinput: string;
}
interface EmojiButtonProps {
  iscommentinput: string;
}

const StyledMention = styled(Mentions) <SytledMentionProps>`
  position:relative;
  padding: 0.063rem;
  ${(props) => (!props.iscommentinput && `
  ${!isNativePlatform
    && `border-bottom-right-radius: 0 !important;
    border-bottom-left-radius: 0 !important;`
    }
  border-top-right-radius: 0.875rem !important;
  border-top-left-radius: 0.875rem !important;
  padding: 0;

  `)}

  textarea {
    border-radius: 0.875rem !important;
    cursor: auto;
    ${(props) => (!props.iscommentinput && `
    ${!isNativePlatform
    && `border-bottom-right-radius: 0 !important;
    border-bottom-left-radius: 0 !important;`
    }
    border-top-right-radius: 0.875rem !important;
    border-top-left-radius: 0.875rem !important;
    min-height: 196px !important;
    height: ${!isNativePlatform ? '196px !important' : '220px !important'};
    max-height: ${!isNativePlatform ? '196px !important' : '220px !important'};
    padding-bottom: 0px !important;
    `)}


    ${(props) => (props.iscommentinput && !isNativePlatform && 'margin-left :0.875rem')}
  }

  ${(props) => (
    props.iscommentinput
      ? ` &.form-control {
            overflow: unset !important;
            border: 1px solid #3A3B46 !important;
            border-radius: 1.875rem !important;
            border-bottom-right-radius: 0rem !important;
            border-top-right-radius: 0rem !important;
            border-right: 0 !important;
            textarea {
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
            }
          }
        `
      : ''
  )
  // eslint-disable-next-line @typescript-eslint/indent
  }
}
`;

const StyledEmoji = styled(Button)`
  z-index:2;
  padding: 10px;
  ${(props) => (props.createpost
    ? `
    left: 0.75rem;
    bottom: 7%;
    `
    : `
    left: 0.438rem;
    bottom: 30%;
    `)}
`;

const EmojiPicker = styled.div<PickerProp>`
    z-index:1;
    ${(props) => (props.createpost ? 'left:1px;' : '')}
    ${(props) => (props.emojiPickerTop ? 'bottom:3.125rem' : 'top:3.125rem')}
`;

const StyledEmojiButton = styled.div<EmojiButtonProps>`
  ${(props) => !props.iscommentinput
    && `background-color: black;
    border-bottom-radius: 1.875rem !important;
    border-bottom-right-radius: 0.875rem !important;
    border-bottom-left-radius: 0.875rem !important;
    padding: 0.625rem;
    margin-top: -0.438rem !important;`
  // eslint-disable-next-line @typescript-eslint/indent
  }
`;
const StyledShadowWrapper = styled.div<StyledShadowWrapperProps>`
width: 100%;
${(props) => (!props.iscommentinput
    && ` border-radius: 0.875rem !important;
  ${props.isMentionsFocused && !isNativePlatform
      ? `
    box-shadow: 0 0 0 2px var(--stroke-and-line-separator-color) !important;
    `
      : `
    box-shadow: none !important;
    `}`
  )}

`;
export interface MentionListProps {
  id: string;
  _id: string;
  userName: string;
  name: string;
  profilePic: string;
}
export interface FormatMentionListProps {
  id: string;
  value: string;
  format: string;
}
interface MentionProps {
  rows: number;
  placeholder?: string;
  isReply?: boolean;
  mentionLists: MentionListProps[];
  messageContent?: string;
  setMessageContent: (val: any) => void;
  formatMentionList: FormatMentionListProps[];
  setFormatMentionList: (val: FormatMentionListProps[]) => void;
  handleSearch: (val: string, prefix: string) => void;
  defaultValue?: string;
  id?: string;
  className?: string;
  isCommentInput?: string;
  onFocusHandler?: () => void;
  onBlurHandler?: () => void;
  isMainPostCommentClick?: boolean;
  notFoundContent?: string;
  showPicker?: boolean;
  setShowPicker?: (val: any) => void;
  createEditPost?: boolean;
  showEmojiButton?: boolean;
}

function MessageTextarea({
  rows,
  placeholder,
  isReply,
  mentionLists,
  handleSearch,
  messageContent,
  setMessageContent,
  formatMentionList,
  setFormatMentionList,
  defaultValue,
  id,
  className,
  isCommentInput,
  onFocusHandler,
  onBlurHandler,
  isMainPostCommentClick,
  notFoundContent,
  showPicker,
  setShowPicker,
  createEditPost,
  showEmojiButton,
}: MentionProps) {
  const { Option } = Mentions;
  const textareaRef = useRef<MentionsRef>(null);
  const optionRef = createRef<HTMLInputElement>();
  const [selectedEmoji, setSelectedEmoji] = useState<string[]>([]);
  const [isMentionsFocused, setIsMentionsFocused] = useState<boolean>(false);
  const [emojiPickerTop, setEmojiPickerTop] = useState<boolean>(false);
  const handleMessage = (e: string) => {
    setMessageContent(e);
  };
  useEffect(() => {
    if (defaultValue) {
      setMessageContent(defaultValue);
    }
  }, [defaultValue, setMessageContent]);
  useEffect(() => {
    if (formatMentionList) {
      setFormatMentionList(formatMentionList);
    }
  }, [formatMentionList, setFormatMentionList]);
  const handleSelect = (option: OptionProps) => {
    setFormatMentionList(formatMentionList);
    const mentionString = `##LINK_ID##${option.key}@${option.value}##LINK_END##`;
    const addFormatObject = {
      id: option.key,
      value: option.value,
      format: mentionString,
    } as FormatMentionListProps;
    if (!formatMentionList.find(
      (mention: FormatMentionListProps) => mention.id === addFormatObject.id,
    )) {
      setFormatMentionList([...formatMentionList, addFormatObject]);
    }
  };
  useEffect(() => {
    if (textareaRef.current && (isReply || isMainPostCommentClick)) {
      textareaRef.current.focus();
    }
  }, [isReply, isMainPostCommentClick]);
  const handleShowPicker = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPicker!(!showPicker);
  };
  const handleEmojiSelect = (emoji: any) => {
    const textarea = textareaRef.current?.textarea;

    if (textarea) {
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;
      const currentValue = messageContent || '';
      const newValue = currentValue.substring(0, startPos)
        + emoji.native
        + currentValue.substring(endPos);
      setSelectedEmoji([...selectedEmoji, emoji.native]);
      setMessageContent!(newValue);
      setTimeout(() => {
        const newCursorPos = startPos + emoji.native.length;
        textarea.selectionStart = newCursorPos;
        textarea.selectionEnd = newCursorPos;
        textarea.focus();
      }, 0);
    }
  };

  const closeEmojiPickerIfOpen = () => {
    if (showPicker) {
      setShowPicker!(false);
    }
  };

  const styledMentionFocusHandler = () => {
    setIsMentionsFocused(true);
    if (onFocusHandler) {
      onFocusHandler();
    }
  };

  const styledMentionBlurHandler = () => {
    setIsMentionsFocused(false);
    if (onBlurHandler) {
      onBlurHandler();
    }
  };
  const changeEmojiPickerPosition: () => void = useCallback(() => {
    const textArea = document.getElementById(id!);
    if (!textArea) { return; }
    const viewportOffset = textArea!.getBoundingClientRect();
    const { top } = viewportOffset;
    if (top > 350) {
      setEmojiPickerTop(true);
    } else {
      setEmojiPickerTop(false);
    }
  }, [id]);
  useEffect(() => {
    window.addEventListener('click', changeEmojiPickerPosition, true);
    window.addEventListener('scroll', changeEmojiPickerPosition, true);
    return () => {
      window.removeEventListener('scroll', changeEmojiPickerPosition, true);
      window.removeEventListener('click', changeEmojiPickerPosition, true);
    };
  }, [changeEmojiPickerPosition]);

  return (
    <>
      <StyledShadowWrapper isMentionsFocused={isMentionsFocused} iscommentinput={isCommentInput!}>
        <StyledMention
          prefix={isCommentInput ? ['@'] : ['@', '#']}
          ref={textareaRef}
          placement={showEmojiButton ? 'bottom' : 'top'} // (default = "bottom")
          iscommentinput={isCommentInput!}
          id={id}
          className={isCommentInput ? className : ''}
          autoSize={{ minRows: rows, maxRows: isCommentInput ? 4 : rows }}
          rows={rows}
          onChange={(e) => (e.endsWith('#@') ? null : handleMessage(e))}
          placeholder={placeholder}
          onSearch={handleSearch}
          onSelect={handleSelect}
          onFocus={() => styledMentionFocusHandler()}
          onBlur={() => styledMentionBlurHandler()}
          value={defaultValue || ''}
          notFoundContent={notFoundContent}
          aria-label="message"
        >
          {mentionLists
            && mentionLists.map((mentionList: MentionListProps) => (
              <Option
                value={mentionList.userName || mentionList.name}
                key={mentionList.id || mentionList._id}
                style={{ zIndex: '100' }}
              >
                <div ref={optionRef} className="list--hover soft-half cursor-pointer">
                  <div>
                    {mentionList.userName && (
                      <UserCircleImage
                        size="2rem"
                        src={mentionList?.profilePic}
                        className="ms-0 me-3 bg-secondary"
                      />
                    )}
                    <span>
                      {mentionList.name ? ' #' : ' @'}
                      {mentionList.userName || mentionList.name}
                    </span>
                  </div>
                </div>
              </Option>
            ))}
        </StyledMention>

        {showEmojiButton
          && (
            <StyledEmojiButton iscommentinput={isCommentInput!}>
              <StyledEmoji
                type="button"
                variant="link"
                aria-label="emoji-picker"
                className={`d-flex align-self-end p-0 ${isCommentInput ? 'p-0 position-absolute' : ''}`}
                createpost={createEditPost}
                isCommentInput={isCommentInput}
              >
                <FontAwesomeIcon icon={solid('smile')} onClick={handleShowPicker} size="lg" />
              </StyledEmoji>
            </StyledEmojiButton>
          )}

      </StyledShadowWrapper>

      {showPicker && (
        <EmojiPicker
          className="position-absolute me-4"
          createpost={createEditPost}
          emojiPickerTop={emojiPickerTop}
        >
          <CustomEmojiPicker
            handleEmojiSelect={handleEmojiSelect}
            onClickOutside={closeEmojiPickerIfOpen}
            isReply={isReply}
          />
        </EmojiPicker>
      )}
    </>

  );
}
MessageTextarea.defaultProps = {
  placeholder: 'Type something...',
  isReply: false,
  defaultValue: '',
  id: '',
  className: '',
  messageContent: '',
  isCommentInput: undefined,
  onFocusHandler: undefined,
  onBlurHandler: undefined,
  isMainPostCommentClick: undefined,
  showPicker: undefined,
  setShowPicker: undefined,
  createEditPost: undefined,
  showEmojiButton: true,
  notFoundContent: 'Type to search for a username',
};
export default MessageTextarea;
