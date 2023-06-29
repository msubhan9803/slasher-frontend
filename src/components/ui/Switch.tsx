import React from 'react';
import styled from 'styled-components';

const SwitchStyledLabel = styled.label`
  input:checked+.slider {
    background-color: #32D74B;
  }
  input:checked+.slider:before {
    -webkit-transform: translateX(1.62rem);
    -ms-transform: translateX(1.62rem);
    transform: translateX(1.87rem);
  }
  input:checked+.slider:after {
    content: 'ON';
    left: 30%;
    color: var(--bs-black)
  }
  .slider:after {
    content: 'OFF';
    color: var(--bs-body-color);
    display: block;
    position: absolute;
    transform: translate(-50%, -50%);
    top: 50%;
    left: 68%;
    font-size: 0.87rem;
    font-weight: 700;
    font-family: roboto;
  }
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #0D0D0E;
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 6.25rem;
    width: 3.75rem;
  }
  .slider:before {
    position: absolute;
    content: "";
    height: 1.25rem;
    width: 1.25rem;
    left: 0.313rem;
    bottom: 0.313rem;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 50%;
  }
`;

const SwitchDiv = styled.div`
  .switch {
    position: relative;
    display: inline-block;
    width: 3.75rem;
    height: 1.87rem;
  }
  .switch input {
    display: none;
  }
`;

interface Props {
  id: string,
  className?: string,
  isChecked?: boolean,
  onSwitchToggle?: (e: React.ChangeEvent<HTMLInputElement>) => void | undefined,
}

function Switch({
  id, className, isChecked, onSwitchToggle,
}: Props) {
  return (
    <SwitchDiv>
      <SwitchStyledLabel className={`switch ${className}`} htmlFor={id} role="switch" aria-checked={isChecked}>
        <input type="checkbox" id={id} onChange={onSwitchToggle} checked={isChecked} />
        <div className="slider round" />
        <span className="visually-hidden">
          switch state:
          {' '}
          {isChecked ? 'on' : 'off'}
        </span>
      </SwitchStyledLabel>
    </SwitchDiv>
  );
}

Switch.defaultProps = {
  className: '',
  isChecked: false,
  onSwitchToggle: () => { },
};

export default Switch;
