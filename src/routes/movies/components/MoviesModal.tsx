/* eslint-disable max-lines */
import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import ModalContainer from '../../../components/ui/CustomModal';
import RoundButton from '../../../components/ui/RoundButton';
import IconRegularGore from '../../../images/icon-regular-gore.png';
import IconRedSolidGore from '../../../images/icon-red-solid-gore.png';
import { createOrUpdateGoreFactor, createOrUpdateRating } from '../../../api/movies';
import { MovieData } from '../../../types';
import { updateMovieUserData } from './updateMovieDataUtils';

interface MovieDetaisProps {
  show: boolean;
  setShow: (value: boolean) => void;
  ButtonType?: 'rating' | 'goreFactorRating' | 'deactivate';
  movieData?: MovieData;
  setMovieData?: React.Dispatch<React.SetStateAction<MovieData | undefined>>
  rateType?: 'rating' | 'goreFactorRating';
}
const RatingStar = styled.div`
  .fa-star {
    width: rem;
    height: rem;
  }
  .rate {
    color: #FF8A00;
  }
`;
const RatingGore = styled.div`
  img {
    width: 2rem;
    aspect-ratio: 1;
  }
`;
function MoviesModal({
  show, setShow, ButtonType, movieData, setMovieData, rateType,
}: MovieDetaisProps) {
  const [deactivate, setDeactivate] = useState(false);
  const closeDeactivateModal = () => {
    setDeactivate(false);
  };
  const initialRating = rateType ? movieData?.userData?.[rateType] ?? 0 : 0;
  // We're using `intialRating` as 1 less than actual value to work for `start`/`goreIcon` component
  const [rating, setRating] = useState<number>(initialRating === 0 ? 0 : (initialRating - 1));
  const params = useParams();
  const closeModal = () => {
    setShow(false);
    // Reset rating on modal close event
    setRating(0);
  };

  const handleRatingSubmit = () => {
    if (!params.id || !rateType || !setMovieData) { return; }

    createOrUpdateRating(params.id, rating + 1).then((res) => {
      updateMovieUserData(res.data, rateType, setMovieData);
      closeModal();
    });
  };
  const handleGoreFactorSubmit = () => {
    if (!params.id || !rateType || !setMovieData) { return; }

    createOrUpdateGoreFactor(params.id, rating + 1).then((res) => {
      updateMovieUserData(res.data, rateType, setMovieData);
      closeModal();
    });
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
          show={show}
          centered
          onHide={closeModal}
        >
          <Modal.Header className="border-0 shadow-none justify-content-end" closeButton />
          <div className="px-5">
            {ButtonType === 'deactivate' && (
              <Modal.Body className="d-flex flex-column align-items-center text-center pb-5">
                <div className="px-5">
                  <h1 className="text-primary h2">Deactivate listing </h1>
                  <p className="h5 px-4">Are you sure you want to deactivate your listing?</p>
                </div>
                <RoundButton onClick={closeModal} className="mt-3 w-100 border-0 bg-dark text-white fs-3 fw-bold">
                  No, do not deactivate
                </RoundButton>
                <RoundButton onClick={() => { setDeactivate(true); setShow(false); }} className="mt-3 w-100 border-0 bg-dark text-white fs-3 fw-bold">
                  Yes, please deactivate my listing
                </RoundButton>
              </Modal.Body>
            )}
            {ButtonType === 'rating' && (
              <Modal.Body className="d-flex flex-column align-items-center text-center pb-5">
                <div className="px-5">
                  <h1 className="text-primary h2">Rate this movie</h1>
                </div>
                <RatingStar className="star-rating my-3">
                  {[...Array(5)].map((star, index) => (
                    <Button
                      variant="link"
                      type="button"
                      key={star}
                      className="px-2 bg-transparent"
                      onClick={() => setRating(index)}
                    >
                      {index <= rating ? (
                        <FontAwesomeIcon icon={solid('star')} size="2x" className="rate" />
                      ) : (
                        <FontAwesomeIcon icon={regular('star')} size="2x" className="text-white" />
                      )}
                    </Button>
                  ))}
                </RatingStar>
                <RoundButton onClick={handleRatingSubmit} className="mt-3 w-100 border-0 bg-primary fw-bold">
                  Submit
                </RoundButton>
              </Modal.Body>
            )}
            {ButtonType === 'goreFactorRating' && (
              <Modal.Body className="d-flex flex-column align-items-center text-center pb-5">
                <div className="px-5">
                  <h1 className="text-primary h2">How gory is this?</h1>
                </div>
                <RatingGore className="star-rating my-3">
                  {[...Array(5)].map((star, index) => (
                    <Button
                      variant="link"
                      type="button"
                      key={star}
                      className="px-2 bg-transparent"
                      onClick={() => setRating(index)}
                    >
                      {index <= rating ? (
                        <img src={IconRedSolidGore} alt="burst icon" />
                      ) : (
                        <img src={IconRegularGore} alt="burst icon" />
                      )}
                    </Button>
                  ))}
                </RatingGore>
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
  setMovieData: () => {},
  rateType: '',
  movieData: {},
};

export default MoviesModal;
