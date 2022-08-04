import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

interface Props {
  label: string;
  icon: IconDefinition;
  iconColor: string;
  width: string;
  height: string;
  addMovie: boolean;
  onClickIcon: (value: string) => void;
}

interface LinearIconProps {
  uniqueId?: string
  width?: string
  height?: string
}

const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
  svg {
    width: ${(props) => props.width};
    height: ${(props) => props.height};
  }
  .detail-movie-icon {
    width: 3.125rem;
    height: 3.125rem;
  }
`;
const StyledRemoveWatchlist = styled.div`
  top: -0.4rem;
  left: 2.1rem;
  border: 0.063rem solid #3A3B46;
  width: 1.5rem;
  height: 1.5rem;

  svg {
    width: 0.781rem;
    height: 0.781rem;
  }
  @media only screen and (min-width: 75rem) and (max-width: 89.938rem) {
    left: 1.9rem;
  }
`;
let instanceCounter = 0;

function ListIcon({
  label, icon, iconColor: color, width, height, addMovie, onClickIcon,
}: Props) {
  const uniqueId = `${instanceCounter += 1}`;

  return (
    <div className="position-relative">
      <LinearIcon role="button" onClick={() => onClickIcon(label)} width={width} height={height} uniqueId={uniqueId} className="d-flex flex-column align-items-center">
        <div className="detail-movie-icon align-items-center bg-white d-flex justify-content-center rounded-circle">
          <FontAwesomeIcon icon={icon} />
        </div>
        <h6 className="mt-2 mb-0">{label}</h6>
        <svg width="0" height="0">
          <linearGradient id={uniqueId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: `${color}`, stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: `${color}`, stopOpacity: '0.6' }} />
          </linearGradient>
        </svg>
      </LinearIcon>
      {addMovie && (
        <StyledRemoveWatchlist role="button" onClick={() => onClickIcon(label)} className="align-items-center bg-black d-flex justify-content-center position-absolute rounded-circle">
          <FontAwesomeIcon icon={solid('times')} size="lg" className="text-primary " />
        </StyledRemoveWatchlist>
      )}
    </div>
  );
}

export default ListIcon;
