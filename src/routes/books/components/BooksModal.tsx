import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import ModalContainer from '../../../components/ui/CustomModal';
import RoundButton from '../../../components/ui/RoundButton';
import RatingButtonGroups from '../../../components/ui/RatingButtonGroups';

interface BookDetaisProps {
  show: boolean;
  setShow: (value: boolean) => void;
  ButtonType?: string;
}
function BooksModal({
  show, setShow, ButtonType,
}: BookDetaisProps) {
  const [deactivate, setDeactivate] = useState(false);
  const closeModal = () => {
    setShow(false);
  };
  const closeDeactivateModal = () => {
    setDeactivate(false);
  };
  const [rating, setRating] = useState(0);
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
            {ButtonType === 'rate' && (
              <Modal.Body className="d-flex flex-column align-items-center text-center pb-5">
                <div className="px-5">
                  <h1 className="text-primary h2">Rate this movie</h1>
                  <p className="h5 px-4">The Curse of La Patasola</p>
                </div>
                <RatingButtonGroups
                  rating={rating}
                  setRating={setRating}
                  size="2x"
                />
                <RoundButton onClick={closeModal} className="mt-3 w-100 border-0 bg-primary fw-bold">
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

BooksModal.defaultProps = {
  ButtonType: '',
};

export default BooksModal;
