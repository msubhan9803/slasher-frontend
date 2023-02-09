/* eslint-disable react/require-default-props */
import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Dropdown,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import UserCircleImage from '../UserCircleImage';
import { markAllReadForSingleConversation } from '../../../api/messages';

interface Props {
  userName: string;
  message: string;
  image: string;
  count?: number;
  timeStamp?: string | null;
  handleDropdownOption?: (value: string) => void;
  matchListId?: string | null;
}

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
  &:hover {
    background-color: #282828;
  }

  a {
    text-decoration: none;
  }

  .message-bottom-border {
    border-bottom: 1px solid #383838;
  }

  &:first-of-type {
    border-radius: var(--bs-border-radius-lg) var(--bs-border-radius-lg) 0 0;
  }

  &:last-of-type {
    border-radius: 0 0 var(--bs-border-radius-lg) var(--bs-border-radius-lg);
    .message-bottom-border {
      border-bottom: none !important;
    }
  }
`;

const StyledLink = styled(Link)`
  min-width: 0; // To fix text wrapping in flex
`;

export const CustomDropDown = styled(Dropdown)`
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
  userName, message, image, count = 0, timeStamp = null,
  handleDropdownOption = () => { }, matchListId = null,
}: Props, ref: any) {
  const sharedYPadding = 'py-3 py-lg-4';

  const handleMarkConversationRead = () => {
    if (!matchListId) return;
    markAllReadForSingleConversation(matchListId);
  };

  return (
    <StyledItem ref={ref} className="bg-dark bg-mobile-transparent">
      <div className="d-flex px-2 px-lg-4 align-items-stretch">
        <StyledLink to={`/app/messages/conversation/${matchListId}`} className={`d-flex flex-grow-1 align-items-center ps-2 pe-1 ps-lg-3 pe-lg-2 ${sharedYPadding} message-bottom-border`}>
          <div>
            <UserCircleImage src={image} />
          </div>
          <div className="flex-grow-1 min-width-0 ps-3">
            <div className="d-flex justify-content-between align-items-center">
              <TrucatedText className="fs-5 mb-0">
                {userName}
              </TrucatedText>
              <DateDisplay className="text-light">{timeStamp}</DateDisplay>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <TrucatedText className="mb-0">
                {decodeURIComponent(message)}
              </TrucatedText>
              {
                count !== 0
                  ? <div className="badge rounded-pill bg-primary ms-3">{count}</div>
                  : <div>&nbsp;</div>
              }
            </div>
          </div>
        </StyledLink>
        <div className={`${sharedYPadding} message-bottom-border`}>
          <CustomDropDown onSelect={handleDropdownOption}>
            <Dropdown.Toggle className="d-flex justify-content-end bg-transparent px-3 px-lg-3 text-white">
              <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
            </Dropdown.Toggle>
            <Dropdown.Menu className="bg-black">
              <Dropdown.Item eventKey="markAsRead" className="text-light" onClick={handleMarkConversationRead}>
                Mark as read
              </Dropdown.Item>
              <Dropdown.Item eventKey="delete" className="text-light">Delete</Dropdown.Item>
              <Dropdown.Item eventKey="blockUser" className="text-light">
                Block user
              </Dropdown.Item>
            </Dropdown.Menu>
          </CustomDropDown>
        </div>
      </div>
    </StyledItem>
  );
}
export default React.forwardRef(UserMessageListItem);
