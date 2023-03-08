import React from 'react';
import { Form } from 'react-bootstrap';
import styled from 'styled-components';

interface CharactersCounterProps {
  counterClass: string;
  charCount: number;
  totalChar: number;
  right?: string;
  top?: string;
  bottom?: string;
}

interface CustomSpanProps {
  right: string;
  top: string;
  bottom: string;
}
const CustomSpan = styled(Form.Text) <CustomSpanProps>`
  margin-top: -1.25rem;
  transform: translateY(-50%);
  right: ${(props) => props.right};
  top: ${(props) => props.top};
  bottom: ${(props) => props.bottom};
`;

function CharactersCounter({
  counterClass, charCount, totalChar, bottom, top, right,
}: CharactersCounterProps) {
  return (
    <CustomSpan
      right={right}
      top={top}
      bottom={bottom}
      className={`${counterClass}`}
    >
      {`${charCount}/${totalChar} characters`}
    </CustomSpan>
  );
}

CharactersCounter.defaultProps = {
  right: undefined,
  top: undefined,
  bottom: undefined,
};

export default CharactersCounter;
