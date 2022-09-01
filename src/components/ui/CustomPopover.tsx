import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import styled from 'styled-components';

interface Props {
  popoverOptions: string[];
  onPopoverClick: (val: string) => void;
}
const StyledPopover = styled.div`
  .btn[aria-describedby="popover-basic"]{
    svg{
      color: var(--bs-primary);
    }
  }
`;
const Custompopover = styled(Popover)`
  z-index :1;
  background:rgb(27,24,24);
  border: 1px solid rgb(56,56,56);
  position:absolute;
  top: 0px !important;
  .popover-arrow{
    &:after{
      border-left-color:rgb(56,56,56);
    }
  }
`;
const PopoverText = styled.p`
  &:hover {
    background: red;
  }
`;

function CustomPopover({ popoverOptions, onPopoverClick }: Props) {
  const popover = (
    <Custompopover id="popover-basic" className="fs-3 py-2 rounded-2">
      {popoverOptions.map((option: string) => (
        <PopoverText key={option} className="ps-4 pb-2 pe-5 pt-2 mb-0 text-light" role="button" onClick={() => onPopoverClick(option)}>{option}</PopoverText>
      ))}
    </Custompopover>
  );
  return (
    <StyledPopover>
      <OverlayTrigger trigger="focus" placement="left" overlay={popover}>
        <Button variant="link" className="pe-1">
          <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
        </Button>
      </OverlayTrigger>
    </StyledPopover>
  );
}

export default CustomPopover;
