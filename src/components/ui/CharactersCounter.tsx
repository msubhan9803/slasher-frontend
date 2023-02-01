import React from 'react';
import { Form } from 'react-bootstrap';
import styled from 'styled-components';

interface CharactersCounterProps {
  counterClass: string;
  charCount: number;
  totalChar: number;
  marginTop?: string;
  marginRight?: string;
}

interface CustomSpanProps {
  marginTop: string;
  marginRight: string;
}
const CustomSpan = styled(Form.Text) <CustomSpanProps>`
  margin-top: -1.43rem;
  margin-right: .5rem;
`;

function CharactersCounter({
  counterClass, charCount, totalChar, marginTop, marginRight,
}: CharactersCounterProps) {
  return (
    <CustomSpan
      marginTop={marginTop}
      marginRight={marginRight}
      className={counterClass}
    >
      {`${charCount}/${totalChar} characters`}
    </CustomSpan>
  );
}

CharactersCounter.defaultProps = {
  marginTop: '',
  marginRights: '',
};

export default CharactersCounter;
