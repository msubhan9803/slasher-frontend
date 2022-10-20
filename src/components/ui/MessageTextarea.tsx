import React, { createRef } from 'react';
import Mentions from 'rc-mentions';
import { OptionProps } from 'rc-mentions/lib/Option';

interface MentionListProps {
  _id: string;
  userName: string;
}
interface FormatMentionListProps {
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
}

function MessageTextarea({
  rows,
  placeholder,
  mentionLists,
  handleSearch,
  setMessageContent,
  formatMentionList,
  setFormatMentionList,
}: MentionProps) {
  const { Option } = Mentions;
  const optionRef = createRef<HTMLInputElement>();

  const handleMessage = (e: string) => {
    setMessageContent(e);
  };

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
    >
      {mentionLists.map((mentionList: MentionListProps) => (
        /* eslint  no-underscore-dangle: 0 */
        <Option value={mentionList.userName} key={mentionList._id}>
          <div ref={optionRef} className="list--hover soft-half pointer">
            <div>
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
};
export default MessageTextarea;
