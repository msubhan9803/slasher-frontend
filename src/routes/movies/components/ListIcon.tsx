import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

  .detail-movie-icon {
    width: 3.125rem;
    height: 3.125rem;
  }
`;
const StyledRemoveWatchlist = styled.div`
  top: -0.313rem;
  right: 0.75rem;
  border: 0.063rem solid #3A3B46;
  width: 1.5rem;
  height: 1.5rem;

  svg {
    width: 0.781rem;
    height: 0.781rem;
  }
`;
function ListIcon({
  like, watch, watchlist, buy,
}: any) {
  return (
    <div className="d-flex justify-content-center justify-content-xxl-between mt-2">
      <LinearIcon uniqueId={like} className="d-flex flex-column align-items-center">
        <div className="detail-movie-icon align-items-center bg-white d-flex justify-content-center rounded-circle">
          <FontAwesomeIcon icon={solid('heart')} size="lg" />
        </div>
        <h6 className="mt-2"> Favorite </h6>
        <svg width="0" height="0">
          <linearGradient id={like} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#8F00FF', stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: '#8F00FF', stopOpacity: '0.6' }} />
          </linearGradient>
        </svg>
      </LinearIcon>
      <LinearIcon uniqueId={watch} className="mx-3 d-flex flex-column align-items-center">
        <div className="detail-movie-icon align-items-center bg-white d-flex justify-content-center rounded-circle">
          <FontAwesomeIcon icon={solid('check')} size="lg" />
        </div>
        <small className="mt-2"> Watch </small>
        <svg width="0" height="0">
          <linearGradient id={watch} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#32D74B', stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: '#32D74B', stopOpacity: '0.6' }} />
          </linearGradient>
        </svg>
      </LinearIcon>
      <div className="position-relative">
        <LinearIcon uniqueId={watchlist} className="me-3 d-flex flex-column align-items-center">
          <div className="detail-movie-icon align-items-center bg-white d-flex justify-content-center rounded-circle">
            <FontAwesomeIcon icon={solid('list-check')} size="lg" />
          </div>
          <small className="mt-2"> Watchlist </small>
          <svg width="0" height="0">
            <linearGradient id={watchlist} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FF8A00', stopOpacity: '1' }} />
              <stop offset="100%" style={{ stopColor: '#FF8A00', stopOpacity: '0.6' }} />
            </linearGradient>
          </svg>
        </LinearIcon>
        <StyledRemoveWatchlist role="button" className="align-items-center bg-black d-flex justify-content-center position-absolute rounded-circle">
          <FontAwesomeIcon icon={solid('times')} size="lg" className="text-primary " />
        </StyledRemoveWatchlist>
      </div>
      <LinearIcon uniqueId={buy} className="d-flex flex-column align-items-center">
        <div className="detail-movie-icon align-items-center bg-white d-flex justify-content-center rounded-circle">
          <FontAwesomeIcon icon={solid('bag-shopping')} size="lg" />
        </div>
        <small className="mt-2"> Buy </small>
        <svg width="0" height="0">
          <linearGradient id={buy} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: '#FF1800', stopOpacity: '0.6' }} />
          </linearGradient>
        </svg>
      </LinearIcon>
    </div>
  );
}

export default ListIcon;
