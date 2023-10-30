/* eslint-disable max-lines */
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import ModalContainer from './CustomModal';
import IconRedSolidGore from '../../images/icon-red-solid-gore.png';
import IconRegularGore from '../../images/icon-regular-gore.png';
import { ratingIcons } from '../../routes/public-home-page/public-home-body/UserReview';
import BorderButton from './BorderButton';
import ModalBodyForDeactivateListing from './ModalBodyForDeactivateListing';
import RatingButtonGroups from './RatingButtonGroups';
import RoundButton from './RoundButton';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  ratingModalType: string;
  rating: RatingValue;
  setRating: (val: RatingValue) => void
  ButtonType?: 'rating' | 'goreFactorRating' | 'deactivate';
  hasRating?: boolean;
  hasGoreFactor?: boolean;
  deactivate: boolean;
  setDeactivate: (val: boolean) => void;
  handleRatingSubmit: () => void;
  handleGoreFactorSubmit: () => void;

}
const RatingGore = styled.div`
  img {
    width: 2rem;
    aspect-ratio: 1;
  }
`;
// Valid rating values
type RatingValue = -1 | 0 | 1 | 2 | 3 | 4;
function CustomRatingsModal({
  show, setShow, ratingModalType, rating, setRating,
  ButtonType, hasRating, hasGoreFactor, deactivate, setDeactivate,
  handleRatingSubmit, handleGoreFactorSubmit,
}: Props) {
  const closeDeactivateModal = () => {
    setDeactivate(false);
  };

  const closeModal = () => {
    setShow(false);
    // Reset rating on modal close event
    setRating(0);
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
              <ModalBodyForDeactivateListing
                onCancel={closeModal}
                onConfirm={() => setDeactivate(true)}
                setShow={() => setShow(false)}
              />
            )}
            {ButtonType === 'rating' && (
              <Modal.Body className="d-flex flex-column align-items-center text-center pb-5">
                <div>
                  <h1 className="text-primary h2">
                    {`${ratingModalType === 'Book' ? 'Rate this Book' : 'Rate this movie'} `}
                  </h1>
                </div>
                <RatingButtonGroups
                  rating={rating}
                  setRating={setRating}
                  size="2x"
                />
                {/* Remove Star Rating Button */}
                {hasRating
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
                  {ratingIcons.map((star, index) => (
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
                {hasGoreFactor
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

CustomRatingsModal.defaultProps = {
  ButtonType: '',
  hasRating: false,
  hasGoreFactor: false,
};

export default CustomRatingsModal;
