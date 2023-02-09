import React, { createRef, useEffect } from 'react';
import Mentions from 'rc-mentions';
import { OptionProps } from 'rc-mentions/lib/Option';
import UserCircleImage from './UserCircleImage';

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
    <Mentions
      rows={rows}
      onChange={(e) => handleMessage(e)}
      placeholder={placeholder}
      onSearch={handleSearch}
      onSelect={handleSelect}
      defaultValue={defaultValue || ''}
      notFoundContent="Type to search for a username"
    >
      {mentionLists.map((mentionList: MentionListProps) => (
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
    </Mentions>
  );
}
MessageTextarea.defaultProps = {
  placeholder: 'Type something...',
  defaultValue: null,
};
export default MessageTextarea;
