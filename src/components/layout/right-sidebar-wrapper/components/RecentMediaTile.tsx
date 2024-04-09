import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { WorthWatchingStatus } from '../../../../types';
import RoundButton from '../../../ui/RoundButton';

const StarLabel = styled.span`
  font-size: .6rem;
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

const RatingSection = styled.div`
  min-height: 1.609rem;
`;

interface Props {
  className?: string;
  image: string;
  title: string;
  addWatchListClick: (value: string) => void;
  year?: number;
  thumbRating?: number;
  numericRating?: number;
  id?: string;
}

function RecentMediaTile({
  className, image, title, year, numericRating, thumbRating, id, addWatchListClick,
}: Props) {
  const renderThumbIcon = (rating: number) => (
    rating === WorthWatchingStatus.Up
      ? <FontAwesomeIcon icon={regular('thumbs-up')} className="text-success rounded-circle" size="xs" />
      : <FontAwesomeIcon icon={regular('thumbs-down')} className="text-primary rounded-circle" size="xs" />
  );

  const hasYearOrThumbRating = year || thumbRating;

  const onAddWatchListClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addWatchListClick(id!);
  };

  return (
    <Link
      to={`/app/movies/${id}`}
    >
      <div className={`${className}`}>
        <div className="position-relative">
          <img alt={`Poster for ${title}`} src={image} className="img-fluid rounded-3" />
        </div>

        <RatingSection className="mt-2 d-flex justify-content-between align-items-center">
          <div>
            {
              numericRating
                ? (
                  <StarLabel className="badge rounded-pill text-black bg-white">
                    <FontAwesomeIcon icon={solid('star')} className="me-1 my-auto" size="xs" />
                    {numericRating}
                  </StarLabel>
                ) : null
            }
          </div>

          <div>
            {
              (hasYearOrThumbRating)
              && (
                <YearAndThumbRating className="d-flex justify-content-between align-items-center pt-1">
                  {thumbRating !== 0 && renderThumbIcon(thumbRating!)}
                </YearAndThumbRating>
              )
            }
          </div>
        </RatingSection>

        <RoundButton className="w-100 mt-2" onClick={(e: React.MouseEvent<HTMLButtonElement>) => onAddWatchListClick(e)}>
          Add to watchlist
        </RoundButton>
      </div>
    </Link>
  );
}

RecentMediaTile.defaultProps = {
  className: '',
  year: null,
  numericRating: null,
  thumbRating: null,
  id: undefined,
};

export default RecentMediaTile;
