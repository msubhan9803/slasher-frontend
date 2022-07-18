import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import {
  Dropdown,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface Props {
  userName: string;
  message: string;
  image: string;
  count?: number;
  timeStamp?: string;
  options?: boolean;
  handleDropdownOption?: (value: string) => void;
}

const RecentMessageImage = styled.img`
  height: 3.625rem;
`;

const MessageContent = styled.div`
  // This stops wide child items from forcing this element from expanding beyond its intended
  // maximum width. It's necessary for getting overflow: hidden to work property for child items.
  min-width: 0;
`;

const TrucatedText = styled.p`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DateDisplay = styled.div`
  white-space: nowrap;
  font-size: 0.75rem;
`;

const StyledItem = styled.div`

  @media(min-width: 992px) {
    background-color: var(--bs-dark);
  }

  &:hover {
    background-color: #282828;
  }

  border-bottom: 1px solid #383838;
  &:first-child {
    // padding-top: 0 !important;
    border-radius: var(--bs-border-radius-lg) var(--bs-border-radius-lg) 0 0;
  }
  &:last-child {
    border-bottom: none;
    // padding-bottom: 0 !important;
    border-radius: 0 0 var(--bs-border-radius-lg) var(--bs-border-radius-lg);
  }
`;

const CustomDropDown = styled(Dropdown)`
  .dropdown-toggle {
    border: none;
    &:hover {
      box-shadow: none;
    }
    &:focus {
      box-shadow: none;
    }
    &:active {
      box-shadow: none;
    }
    &:after {
      display: none;
    }
  }
  .dropdown-toggle[aria-expanded="true"] {
    svg {
      color: var(--bs-primary);
    }
  }
  .dropdown-menu {
    inset: -1.875rem 2.5rem auto auto !important;
  }
  .dropdown-item {
    &:hover {
      background-color: var(--bs-primary) !important;
    }
    &:active {
      background-color: var(--bs-primary) !important;
    }
  }
`;

function UserMessageListItem({
  userName, message, image, count, timeStamp, options, handleDropdownOption,
}: Props) {
  return (
    <StyledItem className="d-flex">
      <Link to="/" className="d-flex align-items-center ps-2 pe-1 ps-lg-4 pe-lg-2 py-3 py-lg-4" style={{ minWidth: 0 }}>
        <div>
          <RecentMessageImage src={image} className="rounded-circle" />
        </div>
        <MessageContent className="px-3 flex-grow-1">
          <TrucatedText className="mb-1 fs-5">
            {userName}
          </TrucatedText>
          <DateDisplay className="text-light d-lg-none">{timeStamp}</DateDisplay>
          <TrucatedText className="mb-0 text-light">{message}</TrucatedText>
        </MessageContent>
        <div className="text-end align-self-center">
          <DateDisplay className="text-light mb-1 d-none d-lg-block">{timeStamp}</DateDisplay>
          {count !== 0 ? <div className="badge rounded-pill bg-primary ms-auto">{count}</div> : <div>&nbsp;</div>}
        </div>
      </Link>
      {
        options && (
          <div className="align-self-center">
            <CustomDropDown onSelect={handleDropdownOption}>
              <Dropdown.Toggle className="d-flex justify-content-end bg-transparent px-3 px-lg-4">
                <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="bg-black">
                <Dropdown.Item eventKey="markAsRead" className="text-light">
                  Mark as read
                </Dropdown.Item>
                <Dropdown.Item eventKey="delete" className="text-light">Delete</Dropdown.Item>
                <Dropdown.Item eventKey="blockUser" className="text-light">
                  Block user
                </Dropdown.Item>
              </Dropdown.Menu>
            </CustomDropDown>
          </div>
        )
      }
    </StyledItem>
  );
}
UserMessageListItem.defaultProps = {
  count: 0,
  timeStamp: null,
  options: false,
  handleDropdownOption: () => { },
};
export default UserMessageListItem;
