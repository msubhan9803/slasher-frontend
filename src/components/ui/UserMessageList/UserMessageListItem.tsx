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
  handleDropdownOption?: (value: string) => void;
}

const RecentMessageImage = styled.img`
  height: 3.125rem;
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

  .message-bottom-border {
    border-bottom: 1px solid #383838;
  }

  &:first-child {
    border-radius: var(--bs-border-radius-lg) var(--bs-border-radius-lg) 0 0;
  }

  &:last-child {
    border-radius: 0 0 var(--bs-border-radius-lg) var(--bs-border-radius-lg);
    .message-bottom-border {
      border-bottom: none !important;
    }
  }
`;

const StyledLink = styled(Link)`
  min-width: 0; // To fix text wrapping in flex
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
  userName, message, image, count, timeStamp, handleDropdownOption,
}: Props) {
  const sharedYPadding = 'py-3 py-lg-4';

  return (
<<<<<<< HEAD
    <ItemContainer className="py-2" key={id}>
      <Col xs={2} className="p-0 text-center">
        <RecentMessageImage src={image} className="rounded-circle bg-secondary position-relative" />
      </Col>
      <Col xs={timeStamp ? 5 : 8} className={`ps-md-4 ps-xl-2 pe-0  ${timeStamp ? 'align-self-center' : 'ps-md-4 px-xl-0 align-self-center'}`}>
        <h1 className="h6 mb-0">{userName}</h1>
        <RecentMessage>{message}</RecentMessage>
      </Col>
      <Col xs={timeStamp ? 4 : 2} className={timeStamp ? 'p-0 pt-1' : 'align-self-center'}>
        <TimeStampStyled
          className="mb-0 rounded-5 small text-end text-light"
        >
          {timeStamp}
        </TimeStampStyled>
        {count !== 0 && <div className="text-end"><span className="badge rounded-pill text-bg-primary text-white">{count}</span></div>}
      </Col>
      {
        options && (
          <Col xs={1} className="p-md-0 px-lg-2">
            <CustomDropDown onSelect={handleDropdownOption}>
              <Dropdown.Toggle className="d-flex justify-content-end bg-transparent pt-1">
                <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="bg-black">
                <Dropdown.Item eventKey="markAsRead" className="text-light">Mark as read</Dropdown.Item>
                <Dropdown.Item eventKey="delete" className="text-light">Delete</Dropdown.Item>
                <Dropdown.Item eventKey="blockUser" className="text-light">Block user</Dropdown.Item>
              </Dropdown.Menu>
            </CustomDropDown>
          </Col>
        )
      }
    </ItemContainer>
=======
    <StyledItem>
      <div className="d-flex px-2 px-lg-4 align-items-stretch">
        <StyledLink to="/" className={`d-flex flex-grow-1 align-items-center ps-2 pe-1 ps-lg-3 pe-lg-2 ${sharedYPadding} message-bottom-border`}>
          <div>
            <RecentMessageImage src={image} className="rounded-circle" />
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
                {message}
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
            <Dropdown.Toggle className="d-flex justify-content-end bg-transparent px-3 px-lg-3">
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
      </div>
    </StyledItem>
>>>>>>> 2420d29209aa0ca8ed69da88fae536e279f7463f
  );
}
UserMessageListItem.defaultProps = {
  count: 0,
  timeStamp: null,
  handleDropdownOption: () => { },
};
export default UserMessageListItem;
