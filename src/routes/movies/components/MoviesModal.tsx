/* eslint-disable max-lines */
import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import ModalContainer from '../../../components/ui/CustomModal';
import RoundButton from '../../../components/ui/RoundButton';
import RatingButtonGroups from '../../../components/ui/RatingButtonGroups';
import IconRegularGore from '../../../images/icon-regular-gore.png';
import IconRedSolidGore from '../../../images/icon-red-solid-gore.png';
import {
  createOrUpdateGoreFactor, createOrUpdateRating, deleteGoreFactor, deleteRating,
} from '../../../api/movies';
import { MovieData } from '../../../types';
import { updateMovieUserData } from './updateMovieDataUtils';
import BorderButton from '../../../components/ui/BorderButton';

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
const RatingGore = styled.div`
  img {
    width: 2rem;
    aspect-ratio: 1;
  }
`;
// Valid rating values
type RatingValue = -1 | 0 | 1 | 2 | 3 | 4;
function MoviesModal({
  show, setShow, ButtonType, movieData, setMovieData, rateType, hasRating, hasGoreFactor,
}: MovieDetaisProps) {
  const [deactivate, setDeactivate] = useState(false);
  const closeDeactivateModal = () => {
    setDeactivate(false);
  };
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
    <>
      {deactivate && (
        <ModalContainer
          show={deactivate}
          centered
          onHide={closeDeactivateModal}
          size="sm"
        >
          <Modal.Header className="border-0 shadow-none justify-content-end" closeButton />
          <div className="px-4">
            <Modal.Body className="d-flex flex-column align-items-center text-center pb-5 px-0">
              <div>
                <h1 className="text-primary h2">Confirmation</h1>
                <p className="h5">
                  Your listing will be deactivated and you will
                  not be charged when it’s time to renew.
                  Please check your email for confirmation.
                </p>
                <p className="h5">
                  Listings will be permanently deleted
                  after 30 days.
                </p>
                <RoundButton onClick={closeDeactivateModal} className="mt-3 w-100 border-0 bg-primary fw-bold">
                  Close
                </RoundButton>
              </div>
            </Modal.Body>
          </div>

        </ModalContainer>
      )}
      {show && (
        <ModalContainer
          $widthMarginAuto
          show={show}
          centered
          onHide={closeModal}
        >
          <Modal.Header className="border-0 shadow-none justify-content-end" closeButton />
          <div className="px-3">
            {ButtonType === 'deactivate' && (
              <Modal.Body className="d-flex flex-column align-items-center text-center pb-5">
                <div className="px-5">
                  <h1 className="text-primary h2">Deactivate listing </h1>
                  <p className="h5 px-4">Are you sure you want to deactivate your listing?</p>
                </div>
                <RoundButton onClick={closeModal} className="mt-3 w-100 border-0 bg-dark text-white">
                  No, do not deactivate
                </RoundButton>
                <RoundButton onClick={() => { setDeactivate(true); setShow(false); }} className="mt-3 w-100 border-0 bg-dark text-white">
                  Yes, please deactivate my listing
                </RoundButton>
              </Modal.Body>
            )}
            {ButtonType === 'rating' && (
              <Modal.Body className="d-flex flex-column align-items-center text-center pb-5">
                <div>
                  <h1 className="text-primary h2">Rate this movie</h1>
                </div>
                <RatingButtonGroups
                  rating={rating}
                  setRating={setRating}
                  size="2x"
                />
                {/* Remove Star Rating Button */}
                { hasRating
                  && (
                    <BorderButton
                      buttonClass="d-flex rate-btn bg-black w-100 d-flex justify-content-center"
                      variant="secondary"
                      iconClass="me-2"
                      iconSize="sm"
                      lable="Clear rating"
                      handleClick={() => setRating(-1)}
                    />
                  )}
                <RoundButton onClick={handleRatingSubmit} className="mt-3 w-100 border-0 bg-primary fw-bold">
                  Submit
                </RoundButton>
              </Modal.Body>
            )}
            {ButtonType === 'goreFactorRating' && (
              <Modal.Body className="d-flex flex-column align-items-center text-center pb-5">
                <div className="px-4">
                  <h1 className="text-primary h2">How gory is this?</h1>
                </div>
                <RatingGore className="star-rating my-3">
                  {[...Array(5)].map((star, index) => (
                    <Button
                      variant="link"
                      type="button"
                      key={star}
                      className="px-2 bg-transparent"
                      onClick={() => setRating(index as RatingValue)}
                    >
                      {index <= rating ? (
                        <img src={IconRedSolidGore} alt="burst icon" />
                      ) : (
                        <img src={IconRegularGore} alt="burst icon" />
                      )}
                    </Button>
                  ))}
                </RatingGore>
                {/* Remove Gore Factor Rating Button */}
                { hasGoreFactor
                  && (
                    <BorderButton
                      buttonClass="d-flex rate-btn bg-black w-100 d-flex justify-content-center"
                      variant="secondary"
                      iconClass="me-2"
                      iconSize="sm"
                      lable="Clear rating"
                      handleClick={() => setRating(-1)}
                    />
                  )}
                <RoundButton onClick={handleGoreFactorSubmit} className="mt-3 w-100 border-0 bg-primary fw-bold">
                  Submit
                </RoundButton>
              </Modal.Body>
            )}
          </div>
        </ModalContainer>
      )}
    </>
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
