import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Dropdown } from 'react-bootstrap';
import styled from 'styled-components';
import ChatOptionDialog from './ChatOptionDialog';

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
    inset: -1.875rem 1.25rem auto auto !important;
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

function ChatOptions() {
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');

  const handleLikesOption = (likeValue: string) => {
    setShow(true);
    setDropDownValue(likeValue);
  };

  return (
    <div className="d-flex justify-content-end">
      <CustomDropDown onSelect={handleLikesOption}>
        <Dropdown.Toggle className="d-flex justify-content-end bg-transparent">
          <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
        </Dropdown.Toggle>
        <Dropdown.Menu className="bg-black">
          <Dropdown.Item eventKey="delete" className="text-light">Delete</Dropdown.Item>
          <Dropdown.Item eventKey="block" className="text-light">Block user</Dropdown.Item>
          <Dropdown.Item eventKey="report" className="text-light">Report</Dropdown.Item>
        </Dropdown.Menu>
      </CustomDropDown>
      <ChatOptionDialog show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </div>
  );
}

export default ChatOptions;
