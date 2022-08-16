import React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

interface TutorialIconProps {
  tutorialIcon: IconDefinition;
  iconColor: string;
  uniqueId: string;
  shadow: string;
}
interface IconBorderProps {
  shadow: string;
}
interface LinearIconProps {
  uniqueId?: string
}
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const StyledIconBorder = styled.div <IconBorderProps>`
  width: 5.334rem;
  height: 5.334rem;
  box-shadow: 0 0 0.571rem ${(props) => props.shadow} !important;
`;
function TutorialIcon({
  tutorialIcon, iconColor, uniqueId, shadow,
}: TutorialIconProps) {
  return (
    <StyledIconBorder shadow={shadow} className="bg-white border d-flex justify-content-center align-items-center mx-auto rounded-circle">
      <LinearIcon uniqueId={uniqueId}>
        <FontAwesomeIcon icon={tutorialIcon} size="2x" />
      </LinearIcon>
      <svg width="0" height="0">
        <linearGradient id={uniqueId} x1="00%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: `${iconColor}`, stopOpacity: '1' }} />
          <stop offset="100%" style={{ stopColor: `${iconColor}`, stopOpacity: '0.6' }} />
        </linearGradient>
      </svg>
    </StyledIconBorder>
  );
}

export default TutorialIcon;
