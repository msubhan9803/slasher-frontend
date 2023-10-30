import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookData } from '../../../types';
import CustomRatingsModal from '../../../components/ui/CustomRatingsModal';
import {
  createOrUpdateGoreFactor, createOrUpdateRating, deleteGoreFactor, deleteRating,
} from '../../../api/books';
import { updateBookUserData } from './updateBookDataUtils';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  ButtonType?: 'rating' | 'goreFactorRating' | 'deactivate';
  bookData?: any;
  setBookData?: React.Dispatch<React.SetStateAction<BookData | undefined>>
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

  const initialRating = rateType ? bookData?.userData?.[rateType] ?? 0 : 0;
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
    if (!params.id || !rateType || !setBookData) { return; }

    if (rating === -1) {
      deleteRating(params.id)
        .then((res) => {
          updateBookUserData(res.data, 'rating', setBookData!);
          closeModal();
        });
    } else {
      createOrUpdateRating(params.id, rating + 1).then((res) => {
        updateBookUserData(res.data, rateType, setBookData);
        closeModal();
      });
    }
  };
  const handleGoreFactorSubmit = () => {
    if (!params.id || !rateType || !setBookData) { return; }

    if (rating === -1) {
      deleteGoreFactor(params.id)
        .then((res) => {
          updateBookUserData(res.data, 'goreFactorRating', setBookData!);
          closeModal();
        });
    } else {
      createOrUpdateGoreFactor(params.id, rating + 1).then((res) => {
        updateBookUserData(res.data, rateType, setBookData);
        closeModal();
      });
    }
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
