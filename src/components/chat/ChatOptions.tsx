import React, { useState } from 'react';
import { createBlockUser } from '../../api/blocks';
import { reportData } from '../../api/report';
import CustomPopover, { PopoverClickProps } from '../ui/CustomPopover';
import ChatOptionDialog from './ChatOptionDialog';
import useProgressButton from '../ui/ProgressButton';

function ChatOptions({ userData }: any) {
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const popoverOption = ['Delete', 'Block user', 'Report'];
  const [popoverClick, setPopoverClick] = useState<PopoverClickProps>();
  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    setShow(true);
    setDropDownValue(value);
    setPopoverClick(popoverClickProps);
  };

  const reportChatUser = (reason: string) => {
    setProgressButtonStatus('loading');
    const reportPayload = {
      targetId: popoverClick?.id,
      reason,
      reportType: 'profile',
    };
    reportData(reportPayload).then(() => {
      setProgressButtonStatus('success');
    })
      /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
    // Ask to block user as well
    setDropDownValue('PostReportSuccessDialog');
  };
  const onBlockYesClick = () => {
    setProgressButtonStatus('loading');
    createBlockUser(userData._id)
      .then(() => {
        setProgressButtonStatus('success');
        setDropDownValue('BlockUserSuccess');
      })
      /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
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
        ProgressButton={ProgressButton}
      />
    </>

  );
}

export default ChatOptions;
