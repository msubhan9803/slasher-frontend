import React from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import styled from 'styled-components';

const StyledInputGroup = styled(InputGroup)`
  .form-control {
    border-left: 1px solid var(--bs-input-border-color);
  }
  .btn {
    background-color: rgb(31, 31, 31);
    border-color: #3a3b46 !important;
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
  showPassword?: boolean;
  passwordVisiblility?: () => void;
  name?: string;
  formik?: any;
}

function CustomInputGroup({
  size, addonContent, label, inputType = 'text', showPassword, passwordVisiblility, formik, name,
}: Props) {
  return (
    <StyledInputGroup className="mb-3" size={size}>
      <InputGroup.Text id="addon-label text-primary">{addonContent}</InputGroup.Text>
      <FormControl
        placeholder={label}
        aria-label={label}
        aria-describedby="addon-label"
        type={inputType}
        name={name}
        onChange={formik?.handleChange}
        className={`${label === 'Password' ? 'border-end-0' : 0}`}
      />
      {label === 'Password' && (
        <Button className="fs-5 text-light border border-start-0 shadow-none" onClick={passwordVisiblility}>
          {showPassword ? 'Hide' : 'Show'}
        </Button>
      )}
    </StyledInputGroup>
  );
}

CustomInputGroup.defaultProps = {
  inputType: 'text',
  name: '',
  showPassword: false,
  passwordVisiblility: () => { },
  formik: undefined,
};

export default CustomInputGroup;
