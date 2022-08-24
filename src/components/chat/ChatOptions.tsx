import React, { useState } from 'react';
import CustomPopover from '../ui/CustomPopover';
import ChatOptionDialog from './ChatOptionDialog';

function ChatOptions() {
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const popoverOption = ['Delete', 'Block user', 'Report'];

  const handleLikesOption = (likeValue: string) => {
    setShow(true);
    setDropDownValue(likeValue);
  };

  return (
    <>
      <CustomPopover popoverOptions={popoverOption} onPopoverClick={handleLikesOption} />
      <ChatOptionDialog show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </>

  );
}

export default ChatOptions;
