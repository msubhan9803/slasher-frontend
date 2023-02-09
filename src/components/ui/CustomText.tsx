import React from 'react';
import styled from 'styled-components';

interface CustomTextProps {
  text: string;
  textColor: string;
  textClass: string;
}
interface TextProps {
  textColor: string;
}

const StyledText = styled.p<TextProps>`
  color: ${(props) => props.textColor};
`;

function CustomText({ text, textColor, textClass }: CustomTextProps) {
  return (
    <StyledText textColor={textColor} className={textClass}>
      {text}
    </StyledText>
  );
}

export default CustomText;
