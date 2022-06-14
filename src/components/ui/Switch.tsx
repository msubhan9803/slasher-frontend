import React from 'react';
import styled from 'styled-components';

const SwitchStyledLabel = styled.label`
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
  }

  .switch input {
    display: none;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #1F1F1F;
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 100px;
    width: 60px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 5px;
    bottom: 5px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 50%;
  }

  input:checked+.slider {
    background-color: #32D74B;
  }

  input:checked+.slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(30px);
  }

  .slider:after {
    content: 'OFF';
    color: #FFFFFF;
    display: block;
    position: absolute;
    transform: translate(-50%, -50%);
    top: 50%;
    left: 68%;
    font-size: 14px;
    font-weight: 700;
    font-family: roboto;
  }

  input:checked+.slider:after {
    content: 'ON';
    left: 30%;
  }
`;

interface Props {
  id: string,
  className?: string,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void | undefined
}

function Switch({
  id, className, onChange,
}: Props) {
  return (
    <SwitchStyledLabel className={`switch ${className}`} htmlFor={id}>
      <input type="checkbox" id={id} onChange={onChange} />
      <div className="slider round" />
    </SwitchStyledLabel>
  );
}

Switch.defaultProps = {
  onChange: undefined,
  className: '',
};

export default Switch;
