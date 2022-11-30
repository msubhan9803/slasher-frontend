import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  OverlayTrigger, Popover, Image,
} from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const UserCircle = styled(Image)`
  width: 2rem;
  height: 2rem;
`;
interface Props {
  popoverOptions: string[];
  onPopoverClick: (val: string, popoverClickProps: PopoverClickProps) => void,
  userProfileIcon?: string;
  userName?: string;
  content?: string;
  id?: string;
  userId?: string;
}
export interface PopoverClickProps {
  content?: string,
  id?: string,
  userId?: string,
  userName?: string
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
  popoverOptions, onPopoverClick, userProfileIcon,
  content, id, userId, userName,
}: Props) {
  const popover = (
    <Custompopover arrowplacement={userProfileIcon ? 'bottom' : 'left'} id="popover-basic" className="fs-3 py-2 rounded-2">
      {popoverOptions && popoverOptions.length > 0 && popoverOptions.map((option: string) => {
        const popoverClickProps = {
          content,
          id,
          userId,
          userName,
        };
        return (
          <PopoverText
            key={option}
            className="ps-4 pb-2 pe-5 pt-2 mb-0 text-light"
            role="button"
            onClick={() => onPopoverClick(option, popoverClickProps as PopoverClickProps)}
          >
            {option}
          </PopoverText>
        );
      })}
    </Custompopover>
  );
  return (
    <StyledPopover>
      <OverlayTrigger trigger="focus" placement={userProfileIcon ? 'bottom' : 'left'} overlay={popover}>
        {userProfileIcon ? (
          /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
          <Link to="" tabIndex={0} role="button" className="btn bg-transparent text-decoration-none shadow-none border-0 pe-1">
            <UserCircle src={userProfileIcon} className="rounded-circle" />
            <p className="mb-0 mt-2 fs-6">Me</p>
          </Link>
        ) : (
          /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
          <Link to="" tabIndex={0} role="button" className="bg-transparent shadow-none border-0 pe-1">
            <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
          </Link>
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
  userName: null,
};

export default CustomPopover;
