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
  onPopoverClick: (val: string, content?: string, id?: string, userId?: string) => void;
  userProfileIcon?: string;
  content?: string;
  id?: string;
  userId?: string;
  handlePopoverOption?: (id:string) => void
}
const StyledPopover = styled.div`
.btn[aria-describedby="popover-basic"]{
  svg{
    color: var(--bs-primary);
  }
}
`;
interface CustomPopoverProps {
  arrowplacement: string;
}
const Custompopover = styled(Popover) <CustomPopoverProps>`
  z-index :1;
  background:rgb(27,24,24);
  border: 1px solid rgb(56,56,56);
  position:absolute;
  top: 0px !important;
  .popover-arrow{
    &:after{
      border-${((props) => props.arrowplacement)}-color:rgb(56,56,56);
    }
  }
`;
const PopoverText = styled.p`
  &:hover {
    background: red;
  }
`;

function CustomPopover({
  popoverOptions, onPopoverClick, userProfileIcon, content, id, userId, handlePopoverOption,
}: Props) {
  const popover = (
    <Custompopover arrowplacement={userProfileIcon ? 'bottom' : 'left'} id="popover-basic" className="fs-3 py-2 rounded-2">
      {popoverOptions && popoverOptions.length > 0 && popoverOptions.map((option: string) => (
        <PopoverText
          key={option}
          className="ps-4 pb-2 pe-5 pt-2 mb-0 text-light"
          role="button"
          onClick={() => onPopoverClick(option, content, id, userId)}
        >
          {option}
        </PopoverText>
      ))}
    </Custompopover>
  );

  const onHandleOption = () => {
    if (handlePopoverOption) {
      handlePopoverOption(userId || '');
    }
  };

  return (
    <StyledPopover>
      <OverlayTrigger trigger="focus" placement={userProfileIcon ? 'bottom' : 'left'} overlay={popover}>
        {userProfileIcon ? (
          <Button variant="link" className="bg-transparent shadow-none border-0 pe-1 pt-1">
            <UserCircle src={userProfileIcon} className="rounded-circle" />
            <p className="mb-0 text-center mt-2 fs-6">Me</p>
          </Button>
        ) : (
          <Button variant="link" className="bg-transparent shadow-none border-0 pe-1" onClick={onHandleOption}>
            <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
          </Button>
        )}
      </OverlayTrigger>
    </StyledPopover>
  );
}

CustomPopover.defaultProps = {
  userProfileIcon: '',
  content: null,
  id: null,
  userId: null,
  handlePopoverOption: null,
};

export default CustomPopover;
