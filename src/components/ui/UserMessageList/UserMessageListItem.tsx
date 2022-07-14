import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Dropdown, Row,
} from 'react-bootstrap';
import styled from 'styled-components';

interface Props {
  id?: number;
  userName: string;
  message: string;
  image: string;
  count?: number;
  timeStamp?: string;
  options?: boolean;
  handleDropdownOption?: (value: string) => void;
}

const RecentMessageImage = styled.img`
  height: 3.125rem;
`;

const RecentMessage = styled.p`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: .75rem;
  color: #CCCCCC;
  width: 26ch;
  margin-bottom: 0;
`;

const TimeStampStyled = styled.p`
  font-size: 0.75rem;
`;

const StyledItem = styled.div`
  border-bottom: 0.125rem solid rgb(23, 23, 24);
  &:last-child {
    border-bottom: none;
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
  id, userName, message, image, count, timeStamp, options, handleDropdownOption,
}: Props) {
  return (
    <StyledItem className="py-2" key={id}>
      <Row className="px-3">
        <Col xs={2} className="text-center ps-2">
          <RecentMessageImage src={image} className="rounded-circle bg-secondary position-relative" />
        </Col>
        <Col xs={timeStamp ? 5 : 8} className={`ps-md-4 ps-xl-2 pe-0  ${timeStamp ? 'align-self-center' : 'ps-md-4 px-xl-0 align-self-center'}`}>
          <h1 className="h6 mb-0">{userName}</h1>
          <RecentMessage>{message}</RecentMessage>
        </Col>
        <Col xs={timeStamp ? 4 : 2} className={timeStamp ? 'pt-1' : ''}>
          <TimeStampStyled
            className="mb-0 rounded-5 small text-end text-light"
          >
            {timeStamp}
          </TimeStampStyled>
          {count !== 0 && <div className="text-end mt-3"><span className="badge rounded-pill text-bg-primary text-white">{count}</span></div>}
        </Col>
        {
          options && (
            <Col xs={1} className="">
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
      </Row>
    </StyledItem>
  );
}
UserMessageListItem.defaultProps = {
  id: 0,
  count: 0,
  timeStamp: '',
  options: false,
  handleDropdownOption: () => { },
};
export default UserMessageListItem;
