import React from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { StyledDislikeIcon, StyledLikeIcon } from '../../routes/movies/components/WorthWatchIcon';
import { WorthWatchingStatus } from '../../types';

interface WortItTextProps {
  customCircleWidth?: string;
  customCircleHeight?: string;
  customIconWidth: string;
  customIconHeight: string;
  worthIt: number | undefined;
  textClass: string;
  divClass: string;
}
interface StylesWortWatchIconProps {
  width: string;
  height: string;
}
const StyleWatchWorthIcon = styled(FontAwesomeIcon) <StylesWortWatchIconProps>`
  width: ${(props) => props.width} !important;
  height: ${(props) => props.height} !important;
  .
`;

function CustomWortItText({
  customCircleWidth, customCircleHeight, customIconWidth, customIconHeight, worthIt,
  textClass, divClass,
}: WortItTextProps) {
  return (
    <div className={`${divClass} d-flex justify-content-center`}>
      {worthIt === WorthWatchingStatus.Up
        ? (
          <StyledLikeIcon width={customCircleWidth} height={customCircleHeight} className="d-flex justify-content-center align-items-center shadow-none bg-transparent me-2 rounded-circle">
            <StyleWatchWorthIcon width={customIconWidth} height={customIconHeight} icon={regular('thumbs-up')} />
          </StyledLikeIcon>
        )
        : (
          <StyledDislikeIcon width={customCircleWidth} height={customCircleHeight} className="d-flex justify-content-center align-items-center shadow-none bg-transparent me-2 rounded-circle">
            <StyleWatchWorthIcon width={customIconWidth} height={customIconHeight} icon={regular('thumbs-down')} />
          </StyledDislikeIcon>
        )}
      <p className={`${textClass} fw-bold m-0 align-self-center`}>

        {worthIt === WorthWatchingStatus.Up
          ? <span style={{ color: 'var(--bs-success)' }}>Worth it!</span>
          : <span style={{ color: '#FF1800' }}>Not worth it!</span>}
      </p>
    </div>
  );
}

CustomWortItText.defaultProps = {
  customCircleWidth: undefined,
  customCircleHeight: undefined,
};

export default CustomWortItText;
