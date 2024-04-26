import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Button, Card } from 'react-bootstrap';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import RoundButton from '../../../ui/RoundButton';
import LikeIconButton from '../../../ui/Poster/LikeIconButton';

const YearAndThumbRating = styled.div`
  font-size: 1.875rem;
`;

const RatingSection = styled.div`
  bottom: 0.563rem;
`;

const RatingDiv = styled.div`
  .fa-star {
    color: var(--bs-orange);
    width: 0.847rem;
    height: 0.808rem;
  }
`;

const StyledPoster = styled.div`
  aspect-ratio: 0.6;
  img{
    width: 9.33rem !important;
    object-fit: cover;
    box-shadow: 0 0 0 1px var(--poster-border-color);
  }
`;

interface Props {
  className?: string;
  image: string;
  title: string;
  addWatchListClick: (value: string) => void;
  onCloseClick: (e: any, id: string) => void;
  year?: number;
  thumbRating?: number;
  numericRating?: number;
  id?: string;
  isBook?: boolean;
}

function RecentMediaTile({
  className, image, title, year, numericRating, thumbRating, id, addWatchListClick, isBook,
  onCloseClick,
}: Props) {
  const renderThumbIcon = (rating: number) => (
    <LikeIconButton
      worthWatching={rating}
      thumbsUpWidth="0.804rem"
      thumbsUpHeight="0.805rem"
      thumbsDownWidth="0.804rem"
      thumbsDownHeight="0.805rem"
      isRecentMediaTile
    />
  );

  const hasYearOrThumbRating = year || thumbRating;

  const onAddWatchListClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addWatchListClick(id!);
  };

  return (
    <Link
      to={isBook ? `/app/books/${id}` : `/app/movies/${id}`}
    >
      <div className={`${className}`}>
        <div className="position-relative">
          <Button variant="link" className="position-absolute p-0 px-2 py-1" style={{ right: '0', zIndex: 1 }} onClick={(e: any) => onCloseClick(e, id ?? '')}>
            <FontAwesomeIcon icon={solid('xmark')} size="lg" />
            <span className="visually-hidden">Dismiss suggestion</span>
          </Button>

          <StyledPoster className="position-relative">
            <LazyLoadImage src={image} alt={`Poster for ${title}`} className="w-100 h-100 rounded-4" />
          </StyledPoster>

          <RatingSection className="w-100 px-2 position-absolute d-flex justify-content-between align-items-center">
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

            <div className="d-flex align-items-center">
              {
                numericRating
                  ? (
                    <RatingDiv className="d-flex justify-content-end">
                      <Card.Text className="rating bg-white mb-0 px-2 rounded-5 fs-5 text-black">
                        <FontAwesomeIcon icon={solid('star')} className="me-1 my-auto" />
                        <span className="h5">{numericRating}</span>
                      </Card.Text>
                    </RatingDiv>
                  ) : null
              }
            </div>
          </RatingSection>

        </div>

        <RoundButton className="w-100 mt-2" onClick={(e: React.MouseEvent<HTMLButtonElement>) => onAddWatchListClick(e)}>
          {isBook ? '+ Reading list' : '+ Watch list'}
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
  isBook: undefined,
};

export default RecentMediaTile;
