import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import LikeIconButton from './LikeIconButton';
import { WorthWatchingStatus } from '../../../types';
import { getYearFromDate } from '../../../utils/date-utils';
import RoundButtonLink from '../RoundButtonLink';

interface PosterProps {
  type?: string;
  name: string;
  year: string;
  worthWatching?: number;
  rating?: number;
  poster?: string;
  deactivate?: boolean;
  editUrl?: string;
}
interface Props {
  type?: string;
}
const PosterCardStyle = styled(Card) <Props>`
  position: relative;

  .poster {
    img {
      // ${(props) => props.type === 'book' && 'width:9.563rem !important'} ;
      object-fit: fill;
      box-shadow: 0 0 0 1px var(--poster-border-color);
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

const MovieName = styled(Card.Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical;
`;
const StyledPoster = styled.div`
  aspect-ratio: 0.6;
  img{
    object-fit: cover;
    box-shadow: 0 0 0 1px var(--poster-border-color);
  }
`;
const EditIcon = styled(Link)`
  position: absolute;
  top: 10px;
  right: 10px;
  color: #FF1800;
  font-size: 1.5rem;
`;
const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  stroke: #000;
  stroke-width: 10px;
`;

function PosterCard({
  type, name, poster, year, worthWatching, rating, deactivate, editUrl,
}: PosterProps) {
  return (
    <PosterCardStyle className="bg-transparent border-0" type={type}>
      {/* {editUrl && (
      <EditIcon to={editUrl}>
        <StyledFontAwesomeIcon icon={solid('pencil-alt')} />
      </EditIcon>
      )} */}
      <div className="poster">
        <StyledPoster>
          <LazyLoadImage src={poster} alt={`${name} poster`} className="w-100 h-100 rounded-4" />
        </StyledPoster>
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
        {deactivate && <h3 className="text-uppercase text-primary text-decoration-none fw-bold">deactivated</h3>}
        <div className="fs-5 d-flex justify-content-between align-items-center m-0 text-light">
          {year && getYearFromDate(year)}
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
        <MovieName className="h3 fw-bold mt-1 ">
          {name}
        </MovieName>
      </Card.Body>
      <Card.Footer>
        {editUrl && (
          <RoundButtonLink
            to={editUrl}
            variant="primary"
            className="w-100 my-3"
          >
            Edit
          </RoundButtonLink>
        )}
      </Card.Footer>
    </PosterCardStyle>
  );
}

PosterCard.defaultProps = {
  type: '',
  rating: null,
  poster: null,
  worthWatching: null,
  deactivate: false,
  editUrl: '',
};

export default PosterCard;
