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
  margintop: string;
  marginright: string;
  right: string;
  top: string;
  bottom: string;
}
const CustomSpan = styled(Form.Text) <CustomSpanProps>`
  margin-top: ${(props) => props.margintop};
  margin-right: ${(props) => props.marginright};
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
      margintop={marginTop}
      marginright={marginRight}
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
  marginTop: '',
  marginRight: '',
  right: undefined,
  top: undefined,
  bottom: undefined,
};

export default CharactersCounter;
