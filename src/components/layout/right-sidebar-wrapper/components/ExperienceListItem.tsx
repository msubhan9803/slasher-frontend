import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { WorthWatchingStatus } from '../../../../types';

const StarLabel = styled.span`
  font-size: .6rem;
  bottom: .2rem;
  right: .2rem;
  .svg-inline--fa {
    color: var(--bs-orange);
    shape-rendering: geometricPrecision; // better rendering for small SVG
  }
`;

const YearAndThumbRating = styled.div`
  font-size: 0.625rem;
  .svg-inline--fa {
    border: 1px solid #3A3B46;
    color: var(--bs-orange);
    font-size: .5rem;
    padding: .15rem;
    shape-rendering: geometricPrecision; // better rendering for small SVG
  }
`;

const MovieTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
`;

interface Props {
  className?: string;
  image: string;
  title: string;
  year?: number;
  thumbRating?: number;
  numericRating?: number;
  id?:string;
}

function WatchListItem({
  className, image, title, year, numericRating, thumbRating, id,
}: Props) {
  const renderThumbIcon = (rating: number) => (
    rating === WorthWatchingStatus.Up
      ? <FontAwesomeIcon icon={regular('thumbs-up')} className="text-success rounded-circle" size="xs" />
      : <FontAwesomeIcon icon={regular('thumbs-down')} className="text-primary rounded-circle" size="xs" />
  );

  const hasYearOrThumbRating = year || thumbRating;

  return (
    <Link
      to={`/app/movies/${id}`}
    >
      <div className={`${className}`}>
        <div className="position-relative">
          <img alt={`Poster for ${title}`} src={image} className="img-fluid rounded-3" />
          {
            numericRating
            && (
              <StarLabel className="position-absolute badge rounded-pill text-black bg-white">
                <FontAwesomeIcon icon={solid('star')} className="me-1 my-auto" size="xs" />
                {numericRating}
              </StarLabel>
            )
          }
        </div>
        {
          (hasYearOrThumbRating)
          && (
            <YearAndThumbRating className="d-flex justify-content-between align-items-center pt-1">
              {year && <span className="text-light">{year}</span>}
              {thumbRating !== 0 && renderThumbIcon(thumbRating!)}
            </YearAndThumbRating>
          )
        }
        <MovieTitle className={hasYearOrThumbRating ? '' : 'mt-2'}>
          {title}
        </MovieTitle>
      </div>
    </Link>
  );
}

WatchListItem.defaultProps = {
  className: '',
  year: null,
  numericRating: null,
  thumbRating: null,
  id: undefined,
};

export default WatchListItem;
