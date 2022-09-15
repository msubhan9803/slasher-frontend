import React from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import styled from 'styled-components';

interface StyleInputProps {
  addoncontent: React.ReactNode
}
const StyledInputGroup = styled(InputGroup) <StyleInputProps>`
  .form-control {
    ${((props) => props.addoncontent && 'border-left: 1px solid var(--bs-input-border-color)')}
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
  addonContent?: React.ReactNode;
  label: string;
  size: string;
  inputType?: string;
  password?: boolean;
  showPassword?: boolean;
  passwordVisiblility?: () => void;
  name?: string;
  value?: string;
  onChangeValue: (val: React.ChangeEvent<HTMLInputElement>) => void;
}

function CustomInputGroup({
  size, addonContent, label, inputType = 'text', showPassword, passwordVisiblility, password, onChangeValue, name, value,
}: Props) {
  return (
    <StyledInputGroup addoncontent={addonContent} className="mb-3" size={size}>
      {addonContent && <InputGroup.Text id="addon-label text-primary">{addonContent}</InputGroup.Text>}
      <FormControl
        placeholder={label}
        aria-label={label}
        aria-describedby="addon-label"
        type={inputType}
        name={name}
        value={value}
        onChange={onChangeValue}
        className={`${password && 'border-end-0'}`}
      />
      {password && (
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
  value: '',
  password: false,
  showPassword: false,
  passwordVisiblility: () => { },
  addonContent: null,
};

export default CustomInputGroup;
