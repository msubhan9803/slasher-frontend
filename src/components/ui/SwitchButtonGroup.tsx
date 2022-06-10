import React from 'react';
import { ButtonGroup, ToggleButton } from 'react-bootstrap';
import styled from 'styled-components';
import { ValueLabelPair } from '../../types';

const StyledButtonGroup = styled(ButtonGroup)`
  --switch-button-group-border-radius: 50px;

  border:1px solid #3A3B46;
  background-color: #1f1f1f;
  border-radius: var(--switch-button-group-border-radius);

  .btn-check + .btn {
    border-radius: var(--switch-button-group-border-radius) !important;
    border: none;
    padding: .75rem 2rem;
  }

  .btn-check:not(:checked) + .btn {
    background:none;
  }
`;

interface Props {
  firstOption: ValueLabelPair,
  secondOption: ValueLabelPair,
  value: string,
  onChange: (newValue: string) => void
}

function SwitchButtonGroup({
  firstOption, secondOption, value, onChange,
}: Props) {
  const selectOptionOnKeyPress = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    associatedValue: string,
  ) => {
    const keyCodesToRespondTo = ['Enter', ' '];
    if (keyCodesToRespondTo.includes(e.key)) {
      onChange(associatedValue);
    }
  };

  return (
    <StyledButtonGroup>
      {[firstOption, secondOption].map((option) => (
        <ToggleButton
          key={option.label}
          id={`radio-${option.value}`}
          type="radio"
          variant="form"
          checked={option.value === value}
          name="radio"
          value={option.value}
          onChange={() => onChange(option.value)}
          onKeyDown={(e) => selectOptionOnKeyPress(e, option.value)} // Added this for accessibility
        >
          {option.label}
        </ToggleButton>
      ))}
    </StyledButtonGroup>
  );
}

export default SwitchButtonGroup;
