import React, { createRef, useEffect } from 'react';
import Mentions from 'rc-mentions';
import { OptionProps } from 'rc-mentions/lib/Option';
import styled from 'styled-components';
import UserCircleImage from './UserCircleImage';

interface SytledMentionProps {
  iscommentinput: boolean;
}

const StyledMention = styled(Mentions) <SytledMentionProps>`
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
      }
    }`
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
  ref?: any;
  isCommentinput?: boolean;
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
  ref,
  isCommentinput,
}: MentionProps) {
  const { Option } = Mentions;
  const optionRef = createRef<HTMLInputElement>();
  const handleMessage = (e: string) => {
    setMessageContent(e);
  };
  useEffect(() => {
    if (defaultValue) {
      setMessageContent(defaultValue);
    }
  }, [defaultValue, setMessageContent]);
  const handleSelect = (option: OptionProps) => {
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

  return (
    <StyledMention
      iscommentinput={isCommentinput!}
      id={id}
      className={isCommentinput ? className : ''}
      autoSize={{ minRows: rows, maxRows: isCommentinput ? 4 : rows }}
      ref={ref}
      rows={rows}
      onChange={(e) => handleMessage(e)}
      placeholder={placeholder}
      onSearch={handleSearch}
      onSelect={handleSelect}
      defaultValue={defaultValue || ''}
      notFoundContent="Type to search for a username"
    >
      {mentionLists?.map((mentionList: MentionListProps) => (
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
  ref: null,
  isCommentinput: false,
};
export default MessageTextarea;
