/* eslint-disable max-lines */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  createOrUpdateGoreFactor, createOrUpdateRating, deleteGoreFactor, deleteRating,
} from '../../../api/movies';
import { MovieData } from '../../../types';
import { updateMovieUserData } from './updateMovieDataUtils';
import CustomRatingsModal from '../../../components/ui/CustomRatingsModal';

interface MovieDetaisProps {
  show: boolean;
  setShow: (value: boolean) => void;
  ButtonType?: 'rating' | 'goreFactorRating' | 'deactivate';
  movieData?: MovieData;
  setMovieData?: React.Dispatch<React.SetStateAction<MovieData | undefined>>
  rateType?: 'rating' | 'goreFactorRating';
  hasRating?: boolean;
  hasGoreFactor?: boolean;
}

// Valid rating values
type RatingValue = -1 | 0 | 1 | 2 | 3 | 4;
function MoviesModal({
  show, setShow, ButtonType, movieData, setMovieData, rateType, hasRating, hasGoreFactor,
}: MovieDetaisProps) {
  const [deactivate, setDeactivate] = useState(false);

  const initialRating = rateType ? movieData?.userData?.[rateType] ?? 0 : 0;
  // We're using `intialRating` as 1 less than actual value to work for `start`/`goreIcon` component
  const [rating, setRating] = useState<RatingValue>(
    initialRating === 0 ? -1 : (initialRating - 1) as RatingValue,
  );
  const params = useParams();
  const closeModal = () => {
    setShow(false);
    // Reset rating on modal close event
    setRating(0);
  };

  const handleRatingSubmit = () => {
    if (!params.id || !rateType || !setMovieData) { return; }

    if (rating === -1) {
      deleteRating(params.id)
        .then((res) => {
          updateMovieUserData(res.data, 'rating', setMovieData!);
          closeModal();
        });
    } else {
      createOrUpdateRating(params.id, rating + 1).then((res) => {
        updateMovieUserData(res.data, rateType, setMovieData);
        closeModal();
      });
    }
  };
  const handleGoreFactorSubmit = () => {
    if (!params.id || !rateType || !setMovieData) { return; }

    if (rating === -1) {
      deleteGoreFactor(params.id)
        .then((res) => {
          updateMovieUserData(res.data, 'goreFactorRating', setMovieData!);
          closeModal();
        });
    } else {
      createOrUpdateGoreFactor(params.id, rating + 1).then((res) => {
        updateMovieUserData(res.data, rateType, setMovieData);
        closeModal();
      });
    }
  };
  return (
    <CustomRatingsModal
      show={show}
      setShow={setShow}
      ratingModalType="Movie"
      rating={rating}
      setRating={setRating}
      ButtonType={ButtonType}
      hasRating={hasRating}
      hasGoreFactor={hasGoreFactor}
      deactivate={deactivate}
      setDeactivate={setDeactivate}
      handleRatingSubmit={handleRatingSubmit}
      handleGoreFactorSubmit={handleGoreFactorSubmit}
    />
  );
}

MoviesModal.defaultProps = {
  ButtonType: '',
  setMovieData: () => { },
  rateType: '',
  movieData: {},
  hasRating: false,
  hasGoreFactor: false,
};

export default MoviesModal;
