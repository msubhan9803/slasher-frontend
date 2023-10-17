/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { MovieData } from '../../../types';
import CustomRatingsModal from '../../../components/ui/CustomRatingsModal';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  ButtonType?: 'rating' | 'goreFactorRating' | 'deactivate';
  bookData?: any;
  setBookData?: React.Dispatch<React.SetStateAction<MovieData | undefined>>
  rateType?: 'rating' | 'goreFactorRating';
  hasRating?: boolean;
  hasGoreFactor?: boolean;
}

// Valid rating values
type RatingValue = -1 | 0 | 1 | 2 | 3 | 4;
function BooksModal({
  show, setShow, ButtonType, bookData, setBookData, rateType, hasRating, hasGoreFactor,
}: Props) {
  const [deactivate, setDeactivate] = useState(false);

  // const initialRating = rateType ? movieData?.userData?.[rateType] ?? 0 : 0;
  // We're using `intialRating` as 1 less than actual value to work for `start`/`goreIcon` component
  const [rating, setRating] = useState<RatingValue>(
    0 as RatingValue,
  );

  const handleRatingSubmit = () => {
    // eslint-disable-next-line no-alert
    alert('rating click (book)');
  };
  const handleGoreFactorSubmit = () => {
    // eslint-disable-next-line no-alert
    alert('gore click (book)');
  };
  return (
    <CustomRatingsModal
      show={show}
      setShow={setShow}
      ratingModalType="Book"
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

BooksModal.defaultProps = {
  ButtonType: '',
  bookData: undefined,
  setBookData: () => { },
  rateType: '',
  hasRating: false,
  hasGoreFactor: false,
};

export default BooksModal;
