import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, OverlayTrigger, Popover, Image,
} from 'react-bootstrap';
import styled from 'styled-components';

const UserCircle = styled(Image)`
  width: 2rem;
  height: 2rem;
`;
interface Props {
  popoverOptions: string[];
  onPopoverClick: (val: string) => void;
  userProfileIcon?: string;
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

function CustomPopover({
  popoverOptions, onPopoverClick, userProfileIcon,
}: Props) {
  const popover = (
    <Custompopover id="popover-basic" className="fs-3 py-2 rounded-2">
      {popoverOptions && popoverOptions.length > 0 && popoverOptions.map((option: string) => (
        <PopoverText
          key={option}
          className="ps-4 pb-2 pe-5 pt-2 mb-0 text-light"
          role="button"
          onClick={() => onPopoverClick(option)}
        >
          {option}
        </PopoverText>
      ))}
    </Custompopover>
  );
  return (
    <StyledPopover>
      <OverlayTrigger trigger="focus" placement={userProfileIcon ? 'bottom' : 'left'} overlay={popover}>
        {userProfileIcon ? (
          <Button variant="link" className="bg-transparent shadow-none border-0 pe-1 pt-1">
            <UserCircle src={userProfileIcon} className="rounded-circle" />
            <p className="mb-0 text-center mt-2 fs-6">Me</p>
          </Button>
        ) : (
          <Button variant="link" className="bg-transparent shadow-none border-0 pe-1">
            <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
          </Button>
        )}
      </OverlayTrigger>
    </StyledPopover>
  );
}

CustomPopover.defaultProps = {
  userProfileIcon: '',
};

export default CustomPopover;
