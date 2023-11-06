import React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

interface GroupIconProps {
  label: string;
  icon: IconDefinition;
  iconColor: string;
  width: string;
  height: string;
  addData: boolean;
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
    .detail-book-icon {
      width: 3.125rem;
      height: 3.125rem;
    }
  `;
const StyledRemoveWatchlist = styled.div`
    top: -0.4rem;
    left: 2.1rem;
    border: 1px solid #3A3B46;
    width: 1.5rem;
    height: 1.5rem;
    svg * {
      fill: red !important;
    }
    svg {
      width: 0.781rem;
      height: 0.781rem;
    }
    @media only screen and (min-width: 75rem) and (max-width: 89.938rem) {
      left: 1.9rem;
    }
  `;
let instanceCounter = 0;

function CustomGroupIcons({
  label, icon, iconColor: color, width, height, addData, onClickIcon,
}: GroupIconProps) {
  const uniqueId = `${instanceCounter += 1}`;
  const handleClickIcon = () => {
    onClickIcon(label);
  };
  return (
    <div>
      <LinearIcon tabIndex={0} role="button" onClick={handleClickIcon} onKeyDown={(e) => { if (e.key === 'Enter') { onClickIcon(label); } }} width={width} height={height} uniqueId={uniqueId} className="d-flex flex-column align-items-center linear-icon">
        <div className="position-relative">
          <div className="detail-book-icon align-items-center bg-white d-flex justify-content-center rounded-circle">
            <FontAwesomeIcon icon={icon} />
          </div>
          {
            addData && (
              <StyledRemoveWatchlist role="button" onClick={handleClickIcon} onKeyDown={(e) => { if (e.key === 'Enter') { onClickIcon(label); } }} className="align-items-center bg-black d-flex justify-content-center position-absolute rounded-circle">
                <FontAwesomeIcon icon={solid('times')} size="lg" className="text-primary " />
              </StyledRemoveWatchlist>
            )
          }
        </div>
        <h1 className="h5 mt-2 mb-0">{label}</h1>
        <svg width="0" height="0" id="svg-icon">
          <linearGradient id={uniqueId} x1="0%" y1="0%" x2="0%" y2="100%" className="linear-icon">
            <stop offset="0%" style={{ stopColor: `${color}`, stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: `${color}`, stopOpacity: '0.6' }} />
          </linearGradient>
        </svg>

      </LinearIcon>
    </div>
  );
}

export default CustomGroupIcons;
