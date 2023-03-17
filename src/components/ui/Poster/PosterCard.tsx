import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import LikeIconButton from './LikeIconButton';
import { WorthWatchingStatus } from '../../../types';

interface PosterProps {
  name: string;
  year: string;
  worthWatching?: number;
  rating?: number;
  poster?: string;
}
const PosterCardStyle = styled(Card)`
  .poster {
    aspect-ratio: 0.67;
    img {
      object-fit: cover;
    }
  }
  .fa-star {
    color: var(--bs-orange);
    width: 0.847rem;
    height: 0.808rem;
  }
  .fa-thumbs-up {
    color: var(--bs-success);
    background-color: #1F1F1F;
    border: 1px solid #3A3B46;
    width: 0.847rem;
    height: 0.808rem;
  }
  .fa-thumbs-down {
    color: var(--bs-primary);
    background-color: #1F1F1F;
    border: 1px solid #3A3B46;
    transform: rotateY(180deg);
    width: 0.847rem;
    height: 0.808rem;
  }
`;
const RatingDiv = styled.div`
  margin-top: -1.875rem;
`;

function PosterCard({
  name, poster, year, worthWatching, rating,
}: PosterProps) {
  return (
    <PosterCardStyle className="bg-transparent border-0">
      <div className="poster">
        <Card.Img variant="top" src={poster} alt={`${name} poster`} className="w-100 h-100 rounded-4" />
      </div>
      {rating !== 0 && (
      <RatingDiv className="d-flex justify-content-end me-2">
        <Card.Text className="rating bg-white mb-0 px-2 rounded-5 fs-5 text-black">
          <FontAwesomeIcon icon={solid('star')} className="me-1 my-auto" />
          <span className="h5">{rating}</span>
        </Card.Text>
      </RatingDiv>
      )}
      <Card.Body className="px-0 pb-4">
        <div className="fs-5 d-flex justify-content-between align-items-center m-0 text-light">
          {year}
          {worthWatching !== WorthWatchingStatus.NoRating && (
          <LikeIconButton
            worthWatching={worthWatching}
            thumbsUpWidth="0.804rem"
            thumbsUpHeight="0.805rem"
            thumbsDownWidth="0.804rem"
            thumbsDownHeight="0.805rem"
          />
          )}
        </div>
        <Card.Text className="h3 fw-bold mt-1">
          {name}
        </Card.Text>
      </Card.Body>
    </PosterCardStyle>
  );
}

PosterCard.defaultProps = {
  rating: null,
  poster: null,
  worthWatching: null,
};

export default PosterCard;
