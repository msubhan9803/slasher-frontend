import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';

interface LinearIconProps {
  uniqueId?: string
}

const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
  svg {
    width: 1.125rem;
  }
`;
function ListIcon() {
  return (
    <div className="d-flex justify-content-between mt-2">
      <LinearIcon uniqueId="like" className="d-flex flex-column align-items-center">
        <div className="align-items-center bg-white d-flex justify-content-center rounded-circle" style={{ width: '3.125rem', height: '3.125rem' }}>
          <FontAwesomeIcon icon={solid('heart')} size="lg" />
        </div>
        <h6 className="mt-2"> Favorite </h6>
        <svg width="0" height="0">
          <linearGradient id="like" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#8F00FF', stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: '#8F00FF', stopOpacity: '0.6' }} />
          </linearGradient>
        </svg>
      </LinearIcon>
      <LinearIcon uniqueId="watch" className="d-flex flex-column align-items-center">
        <div className="align-items-center bg-white d-flex justify-content-center rounded-circle" style={{ width: '3.125rem', height: '3.125rem' }}>
          <FontAwesomeIcon icon={solid('check')} size="lg" />
        </div>
        <small className="mt-2"> Watch </small>
        <svg width="0" height="0">
          <linearGradient id="watch" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#32D74B', stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: '#32D74B', stopOpacity: '0.6' }} />
          </linearGradient>
        </svg>
      </LinearIcon>
      <LinearIcon uniqueId="buy" className="d-flex flex-column align-items-center">
        <div className="align-items-center bg-white d-flex justify-content-center rounded-circle" style={{ width: '3.125rem', height: '3.125rem' }}>
          <FontAwesomeIcon icon={solid('bag-shopping')} size="lg" />
        </div>
        <small className="mt-2"> Buy </small>
        <svg width="0" height="0">
          <linearGradient id="buy" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: '#FF1800', stopOpacity: '0.6' }} />
          </linearGradient>
        </svg>
      </LinearIcon>
      <LinearIcon uniqueId="watchlist" className="d-flex flex-column align-items-center">
        <div className="align-items-center bg-white d-flex justify-content-center rounded-circle" style={{ width: '3.125rem', height: '3.125rem' }}>
          <FontAwesomeIcon icon={solid('list-check')} size="lg" />
        </div>
        <small className="mt-2"> Watchlist </small>
        <svg width="0" height="0">
          <linearGradient id="watchlist" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF8A00', stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: '#FF8A00', stopOpacity: '0.6' }} />
          </linearGradient>
        </svg>
      </LinearIcon>
    </div>
  );
}

export default ListIcon;
