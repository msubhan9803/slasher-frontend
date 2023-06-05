/* eslint-disable max-lines */
import React, {
  createRef, useEffect, useRef, useState,
} from 'react';
import Mentions from 'rc-mentions';
import { OptionProps } from 'rc-mentions/lib/Option';
import { MentionsRef } from 'rc-mentions/lib/Mentions';
import styled from 'styled-components';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import UserCircleImage from './UserCircleImage';
import CustomEmojiPicker from './CustomEmojiPicker';

interface SytledMentionProps {
  iscommentinput: string;
}
interface PickerProp {
  createpost: any;
}

const StyledMention = styled(Mentions) <SytledMentionProps>`
  position:relative;
  padding: 0.063rem;
  textarea {
    border-radius: 0.875rem !important;
    ${(props) => (props.iscommentinput && 'margin-left :0.875rem')}
  }
  ${(props) => (props.iscommentinput
    ? `&.form-control{
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
    : '')
}
  }
`;

const StyledEmoji = styled(Button)`
  z-index:2;
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
    ${(props) => (props.createpost ? 'left:1px;' : 'top:3.125rem;')}
`;
export interface MentionListProps {
  id: string;
  userName: string;
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
  setMessageContent: (val: any) => void;
  formatMentionList: FormatMentionListProps[];
  setFormatMentionList: (val: FormatMentionListProps[]) => void;
  handleSearch: (val: string) => void;
  defaultValue?: string;
  id?: string;
  className?: string;
  isCommentInput?: string;
  onFocusHandler?: () => void;
  onBlurHandler?: () => void;
  isMainPostCommentClick?: boolean;
  showPicker?: boolean;
  setShowPicker?: (val: any) => void;
  createEditPost?: boolean;
}

function MessageTextarea({
  rows,
  placeholder,
  isReply,
  mentionLists,
  handleSearch,
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
  showPicker,
  setShowPicker,
  createEditPost,
}: MentionProps) {
  const { Option } = Mentions;
  const textareaRef = useRef<MentionsRef>(null);
  const optionRef = createRef<HTMLInputElement>();
  const [selectedEmoji, setSelectedEmoji] = useState<string[]>([]);
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
  const handleShowPicker = () => {
    setShowPicker!(!showPicker);
  };
  const handleEmojiSelect = (emoji: any) => {
    setSelectedEmoji([...selectedEmoji, emoji.native]);
    setMessageContent!((prevMessage: string) => prevMessage + emoji.native);
  };
  return (
    <>
      <StyledEmoji
        type="button"
        variant="link"
        aria-label="emoji-picker"
        className=" d-flex align-self-end p-0 position-absolute"
        createpost={createEditPost}
      >
        <FontAwesomeIcon icon={solid('smile')} onClick={handleShowPicker} size="lg" />
      </StyledEmoji>

      <StyledMention
        ref={textareaRef}
        iscommentinput={isCommentInput!}
        id={id}
        className={isCommentInput ? className : ''}
        autoSize={{ minRows: rows, maxRows: isCommentInput ? 4 : rows }}
        rows={rows}
        onChange={(e) => handleMessage(e)}
        placeholder={placeholder}
        onSearch={handleSearch}
        onSelect={handleSelect}
        onFocus={() => (onFocusHandler ? onFocusHandler() : {})}
        onBlur={() => (onBlurHandler ? onBlurHandler() : {})}
        value={defaultValue || ''}
        notFoundContent="Type to search for a username"
        aria-label="message"
      >
        {mentionLists && mentionLists?.map((mentionList: MentionListProps) => (
          <Option value={mentionList.userName} key={mentionList.id} style={{ zIndex: '100' }}>
            <div ref={optionRef} className="list--hover soft-half cursor-pointer">
              <div>
                <UserCircleImage size="2rem" src={mentionList?.profilePic} className="ms-0 me-3 bg-secondary" />
                <span>
                  &nbsp;@
                  {mentionList.userName}
                </span>
              </div>
            </div>
          </Option>
        ))}
      </StyledMention>

      {showPicker && (
        <EmojiPicker
          className="position-absolute me-4"
          createpost={createEditPost}
        >
          <CustomEmojiPicker handleEmojiSelect={handleEmojiSelect} isReply={isReply} />
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
  isCommentInput: undefined,
  onFocusHandler: undefined,
  onBlurHandler: undefined,
  isMainPostCommentClick: undefined,
  showPicker: undefined,
  setShowPicker: undefined,
  createEditPost: undefined,
};
export default MessageTextarea;
