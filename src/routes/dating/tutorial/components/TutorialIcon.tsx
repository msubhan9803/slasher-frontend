import React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Image } from 'react-bootstrap';

interface TutorialIconProps {
  tutorialIcon?: IconDefinition;
  customTutorialIcon?: string;
  iconColor: string;
  uniqueId: string;
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
  width: 80px;
  height: 80px;
  box-shadow: 0 0 0.571rem ${(props) => props.shadow} !important;
`;
function TutorialIcon({
  tutorialIcon, iconColor, uniqueId, customTutorialIcon,
}: TutorialIconProps) {
  return (
    <StyledIconBorder shadow={iconColor} className="bg-white border d-flex justify-content-center align-items-center mx-auto rounded-circle">
      <LinearIcon uniqueId={uniqueId}>
        {tutorialIcon ? (
          <FontAwesomeIcon icon={tutorialIcon} size="2x" className="mt-2" />
        ) : (
          <Image src={customTutorialIcon} alt="" />
        )}
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

TutorialIcon.defaultProps = {
  tutorialIcon: '',
  customTutorialIcon: '',
};

export default TutorialIcon;
