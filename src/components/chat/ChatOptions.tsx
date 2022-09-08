import React, { useState } from 'react';
import CustomPopover from '../ui/CustomPopover';
import ChatOptionDialog from './ChatOptionDialog';

function ChatOptions() {
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const popoverOption = ['Delete', 'Block user', 'Report'];

  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };

  return (
    <>
      <CustomPopover popoverOptions={popoverOption} onPopoverClick={handlePopoverOption} />
      <ChatOptionDialog show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </>

  );
}

export default ChatOptions;
