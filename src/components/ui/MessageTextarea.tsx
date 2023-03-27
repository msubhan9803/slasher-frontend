import React, { createRef, useEffect, useRef } from 'react';
import Mentions from 'rc-mentions';
import { OptionProps } from 'rc-mentions/lib/Option';
import { MentionsRef } from 'rc-mentions/lib/Mentions';
import styled from 'styled-components';
import UserCircleImage from './UserCircleImage';

interface SytledMentionProps {
  iscommentinput: string;
}

const StyledMention = styled(Mentions) <SytledMentionProps>`
  padding: 1rem;
  textarea {
    border-radius: 0.875rem !important;
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
  mentionLists: MentionListProps[];
  setMessageContent: (val: string) => void;
  formatMentionList: FormatMentionListProps[];
  setFormatMentionList: (val: FormatMentionListProps[]) => void;
  handleSearch: (val: string) => void;
  defaultValue?: string;
  id?: string;
  className?: string;
  isCommentInput?: string;
  onFocusHandler?: () => void;
  onBlurHandler?: () => void;
}

function MessageTextarea({
  rows,
  placeholder,
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
}: MentionProps) {
  const { Option } = Mentions;
  const textareaRef = useRef<MentionsRef>(null);
  const optionRef = createRef<HTMLInputElement>();
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
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <StyledMention
      autoFocus
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
          <div ref={optionRef} className="list--hover soft-half pointer">
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
  );
}
MessageTextarea.defaultProps = {
  placeholder: 'Type something...',
  defaultValue: '',
  id: '',
  className: '',
  isCommentInput: undefined,
  onFocusHandler: undefined,
  onBlurHandler: undefined,
};
export default MessageTextarea;
