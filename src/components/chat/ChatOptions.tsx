import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Button, OverlayTrigger, Popover,
} from 'react-bootstrap';
import styled from 'styled-components';
import ChatOptionDialog from './ChatOptionDialog';

const CustomPopover = styled(Popover)`
  z-index :1;
  background:rgb(27,24,24);
  border: 0.063rem solid rgb(56,56,56);
  position:absolute;
  top: 0rem !important;
  .popover-arrow{
    &:after{
      border-left-color:rgb(56,56,56);
    }
  }
`;
const PopoverText = styled.p`
  &:hover {
    background: var(--bs-primary);
  }
`;
const StyledPopover = styled.div`
  .btn[aria-describedby="popover-basic"] {
    svg {
      color: var(--bs-primary);
    }
  }
`;
function ChatOptions() {
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const optionValues = ['Delete', 'Block user', 'Report'];

  const handleLikesOption = (likeValue: string) => {
    setShow(true);
    setDropDownValue(likeValue);
  };
  const popover = (
    <CustomPopover id="popover-basic" className="py-2 rounded-2">
      {optionValues.map((value: string) => (
        <PopoverText key={value} onClick={() => handleLikesOption(value)} className="ps-4 pb-2 pe-5 pt-2  mb-0" role="button">
          {value}
        </PopoverText>
      ))}
    </CustomPopover>
  );

  return (
    <StyledPopover>
      <OverlayTrigger trigger="click" placement="left" rootClose overlay={popover}>
        <Button className="bg-transparent shadow-none border-0 py-0 px-2" variant="lg">
          <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
        </Button>
      </OverlayTrigger>
      <ChatOptionDialog show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </StyledPopover>
  );
}

export default ChatOptions;
