import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Dropdown } from 'react-bootstrap';
import styled from 'styled-components';

const DropDownCustomMenu = styled(Dropdown.Toggle)`
  background-color : rgb(19, 17, 17);
  border:none;
  &:hover {
    background-color : rgb(19, 17, 17);
    box-shadow :none
  }
  &:focus {
    background-color : rgb(19, 17, 17);
    box-shadow :none
  }
  &:active&:focus {
    box-shadow :none
  }
  &:after {
    display: none;
  }
`;

function ChatOptions() {
  return (
    <Dropdown>
      <DropDownCustomMenu className="d-flex justify-content-end">
        <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="2x" />
      </DropDownCustomMenu>
      <Dropdown.Menu>
        <Dropdown.Item eventKey="1">Report Message</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>

  );
}

export default ChatOptions;
