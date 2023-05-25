import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBlockUser } from '../../api/blocks';
import { reportData } from '../../api/report';
import CustomPopover, { PopoverClickProps } from '../ui/CustomPopover';
import ChatOptionDialog from './ChatOptionDialog';

function ChatOptions({ userData }: any) {
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const popoverOption = ['Delete', 'Block user', 'Report'];
  const [popoverClick, setPopoverClick] = useState<PopoverClickProps>();
  const navigate = useNavigate();

  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    setShow(true);
    setDropDownValue(value);
    setPopoverClick(popoverClickProps);
  };

  const reportChatUser = (reason: string) => {
    const reportPayload = {
      targetId: popoverClick?.id,
      reason,
      reportType: 'profile',
    };
    reportData(reportPayload)
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
    // Ask to block user as well
    setDropDownValue('PostReportSuccessDialog');
  };
  const onBlockYesClick = () => {
    createBlockUser(userData._id)
      .then(() => {
        setShow(false);
        navigate('/app/home');
      })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };
  return (
    <>
      <CustomPopover
        popoverOptions={popoverOption}
        onPopoverClick={handlePopoverOption}
        id={userData._id}
      />
      <ChatOptionDialog
        show={show}
        setShow={setShow}
        slectedDropdownValue={dropDownValue}
        handleReport={reportChatUser}
        onBlockYesClick={onBlockYesClick}
      />
    </>

  );
}

export default ChatOptions;
