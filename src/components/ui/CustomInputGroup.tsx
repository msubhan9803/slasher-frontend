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
`;

interface Props {
  addonContent: React.ReactNode;
  label: string;
  inputType?: string;
}

function CustomInputGroup({ addonContent, label, inputType = 'text' }: Props) {
  return (
    <StyledInputGroup className="mb-3">
      <InputGroup.Text id="addon-label">{addonContent}</InputGroup.Text>
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
