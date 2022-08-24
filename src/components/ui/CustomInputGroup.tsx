import React from 'react';
import { InputGroup, FormControl } from 'react-bootstrap';
import styled from 'styled-components';

const StyledInputGroup = styled(InputGroup)`
  .form-control {
    border-left: 1px solid var(--bs-input-border-color);
  }
  .input-group-text {
    background-color: rgb(31, 31, 31);
    border-color: #3a3b46;
    border-radius: 10px;
  }
  svg {
    color: var(--bs-primary);
    min-width: 30px;
  }
`;

interface Props {
  addonContent: React.ReactNode;
  label: string;
  size: string;
  inputType?: string;
}

function CustomInputGroup({
  size, addonContent, label, inputType = 'text',
}: Props) {
  return (
    <StyledInputGroup className="mb-3" size={size}>
      <InputGroup.Text id="addon-label text-primary">{addonContent}</InputGroup.Text>
      <FormControl
        placeholder={label}
        aria-label={label}
        aria-describedby="addon-label"
        type={inputType}
      />
    </StyledInputGroup>
  );
}

CustomInputGroup.defaultProps = {
  inputType: 'text',
};

export default CustomInputGroup;
