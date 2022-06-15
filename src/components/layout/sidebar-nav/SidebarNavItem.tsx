import React from 'react';
import {
  Button,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

interface Props {
  label: string;
  icon: IconDefinition;
  color?: string;
}

const StyledInputGroup = styled(InputGroup)`
  .input-group-text {
    background-color: rgb(31, 31, 31);
    border-radius: 10px;
    border:none;
  }
  svg {
    color: var(--bs-white );
    min-width: 30px;
  }
  .btn{
    &:focus{
      box-shadow : none !important;
    }
    &:active{
      background-color: rgb(31, 31, 31);
    }
  }
`;

function SidebarNavItem({
  label, icon, color,
}: Props) {
  return (
    <Form className="me-auto w-100">
      <StyledInputGroup className="mb-3">
        <InputGroup.Text id="addon-label text-primary">
          <FontAwesomeIcon icon={icon} size="lg" className="me-2" style={{ color: `${color}` }} />
        </InputGroup.Text>
        <Button
          variant="form"
          size="lg"
          className="w-50 border-0 text-start p-0 fs-6"
          name="men"
        >
          {label}
        </Button>

      </StyledInputGroup>
    </Form>
  );
}
SidebarNavItem.defaultProps = {
  color: '',
};
export default SidebarNavItem;
