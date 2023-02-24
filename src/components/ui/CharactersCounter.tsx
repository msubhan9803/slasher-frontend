import React from 'react';
import { Form } from 'react-bootstrap';
import styled from 'styled-components';

interface CharactersCounterProps {
  counterClass: string;
  charCount: number;
  totalChar: number;
  marginTop?: string;
  marginRight?: string;
  right?: string;
  top?: string;
  bottom?: string;
}

interface CustomSpanProps {
  marginTop: string;
  marginRight: string;
  right: string;
  top: string;
  bottom: string;
}
const CustomSpan = styled(Form.Text) <CustomSpanProps>`
  margin-top: ${(props) => props.marginTop};
  margin-right: ${(props) => props.marginRight};
  transform: translateY(-50%);
  right: ${(props) => props.right};
  top: ${(props) => props.top};
  bottom: ${(props) => props.bottom};
`;

function CharactersCounter({
  counterClass, charCount, totalChar, marginTop, marginRight, bottom, top, right,
}: CharactersCounterProps) {
  return (
    <CustomSpan
      marginTop={marginTop}
      marginRight={marginRight}
      right={right}
      top={top}
      bottom={bottom}
      className={`${counterClass} position-absolute`}
    >
      {`${charCount}/${totalChar} characters`}
    </CustomSpan>
  );
}

CharactersCounter.defaultProps = {
  marginTop: '',
  marginRight: '',
  right: undefined,
  top: undefined,
  bottom: undefined,
};

export default CharactersCounter;
