import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { WorthWatchingStatus } from '../../../../types';
import RoundButton from '../../../ui/RoundButton';
import { StyledDislikeIcon, StyledLikeIcon } from '../../../../routes/movies/components/WorthWatchIcon';
import { StyleWatchWorthIcon } from '../../../../routes/movies/movie-details/AboutDetails';

const StarLabel = styled.span`
  font-size: 0.938rem;
  .svg-inline--fa {
    color: var(--bs-orange);
    shape-rendering: geometricPrecision; // better rendering for small SVG
  }
`;

const YearAndThumbRating = styled.div`
  font-size: 1.875rem;
`;

const RatingSection = styled.div`
  min-height: 2.313rem;
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
    <>
      {rating === WorthWatchingStatus.Up
        && (
          <StyledLikeIcon className="d-flex justify-content-center align-items-center shadow-none bg-transparent rounded-circle">
            <StyleWatchWorthIcon icon={regular('thumbs-up')} />
          </StyledLikeIcon>
        )}

      {rating === WorthWatchingStatus.Down
        && (
          <StyledDislikeIcon role="button" className="d-flex justify-content-center align-items-center shadow-none bg-transparent rounded-circle">
            <StyleWatchWorthIcon icon={regular('thumbs-down')} />
          </StyledDislikeIcon>
        )}
    </>
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
          <div className="d-flex align-items-center">
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
                <YearAndThumbRating className="d-flex justify-content-between align-items-center">
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
