import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Dropdown } from 'react-bootstrap';
import styled from 'styled-components';

const dropdownBgColor = 'rgb(19,17,17)';

const CustomDropDown = styled(Dropdown)`
  .dropdown-toggle {
    background-color: ${dropdownBgColor};
    border: none;
    &:hover {
      background-color: ${dropdownBgColor};
      box-shadow: none
    }
    &:focus {
      background-color: ${dropdownBgColor};
      box-shadow: none
    }
    &:active&:focus {
      box-shadow: none
    }
    &:after {
      display: none;
    }
  }

  .dropdown-menu {
    background-color: ${dropdownBgColor};
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
  return (
    <div className="d-flex justify-content-end">
      <CustomDropDown>
        <Dropdown.Toggle className="d-flex justify-content-end">
          <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="2x" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item eventKey="1" className="text-light">Report Message</Dropdown.Item>
        </Dropdown.Menu>
      </CustomDropDown>
    </div>
  );
}

export default ChatOptions;
