import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import styled from 'styled-components';

const StyledInputGroup = styled(InputGroup)`
  .addon{
    z-index: 999;
  }
  .passowrd {
    right: 0.5px;
    padding: 11px 14px;
    width: 4rem;
  }
  .btn {
    background-color: rgb(31, 31, 31);
    border-color: #3a3b46 !important;
  }
  .input-group-text {
    background-color: var(--bs - dark);
    border-color: #3a3b46;
    border-radius: 10px;
  }
  svg {
    color: var(--bs-primary);
    min-width: 30px;
    height: 25px;
  }
`;

interface Props {
  addonContent?: IconDefinition;
  label: string;
  size: string;
  inputType?: string;
  password?: boolean;
  showPassword?: boolean;
  passwordVisiblility?: () => void;
  name?: string;
  value?: string;
  autoComplete?: string;
  onChangeValue: (val: React.ChangeEvent<HTMLInputElement>) => void;
}

function CustomInputGroup({
  size, addonContent, label, inputType = 'text', showPassword, passwordVisiblility, password, onChangeValue, name, value, autoComplete,
}: Props) {
  return (
    <StyledInputGroup className="mb-3 align-items-center" size={size}>
      {addonContent
        && <FontAwesomeIcon className="addon ms-3 position-absolute" icon={addonContent} size="lg" />}
      <FormControl
        placeholder={label}
        aria-label={label}
        type={inputType}
        name={name}
        autoComplete={autoComplete}
        value={value}
        onChange={onChangeValue}
        className="rounded-3"
        style={{ paddingLeft: addonContent ? '76px' : '', paddingRight: addonContent && password ? '60px' : '' }}
      />
      {password && (
        <Button
          className="addon passowrd fs-5 text-light border-0 position-absolute"
          onClick={passwordVisiblility}
        >
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
  autoComplete: '',
  password: false,
  showPassword: false,
  passwordVisiblility: () => { },
  addonContent: null,
};

export default CustomInputGroup;
