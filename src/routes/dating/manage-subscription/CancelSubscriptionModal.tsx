import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import ModalContainer from '../../../components/ui/CustomModal';
import RoundButton from '../../../components/ui/RoundButton';

interface ModalProps {
  show: boolean;
  setShow: (value: boolean) => void;
}

function ConfirmCancelModal({ show, setShow }: ModalProps) {
  const closeModal = () => {
    setShow(false);
  };
  return (
    <ModalContainer
      show={show}
      centered
      onHide={closeModal}
      size="md"
    >
      <Modal.Header className="border-0 shadow-none justify-content-end" closeButton />

      <Modal.Body className="d-flex flex-column text-center pt-0 p-5 mx-md-5 ">
        <h2 className="text-primary fw-bold">
          Confirmation
        </h2>
        <div className="mt-3 mb-4">
          Your subscription will be cancel and you
          will not be charged when it’s time to renew.
          Please check your email for confirmation.
        </div>
        <RoundButton onClick={closeModal}>Close</RoundButton>
      </Modal.Body>
    </ModalContainer>
  );
}

function cancelSubscriptionModal({ show, setShow }: ModalProps) {
  const [confirmSubShow, setConfirmSubShow] = useState<boolean>(false);

  const closeModal = () => {
    setShow(false);
  };
  const handleCancelMySub = () => {
    setShow(false);
    setConfirmSubShow(true);
  };

  return (
    <>
      <ModalContainer
        show={show}
        centered
        onHide={closeModal}
        size="md"
      >
        <Modal.Header className="border-0 shadow-none justify-content-end" closeButton />

        <Modal.Body className="d-flex flex-column text-center pt-0 p-5 mx-md-5 ">
          <h1 className="text-primary fw-bold">
            Cancel subscription
          </h1>
          <div className="mt-2 mb-4">
            Are you sure you want to cancel
            your subscription?
          </div>

          <RoundButton className="btn-dark" onClick={closeModal}>No, do not cancel</RoundButton>
          <RoundButton className="btn-dark mt-4" onClick={handleCancelMySub}>Yes, please cancel my subscription</RoundButton>
        </Modal.Body>
      </ModalContainer>

      <ConfirmCancelModal
        show={confirmSubShow}
        setShow={setConfirmSubShow}
      />
    </>

  );
}

export default cancelSubscriptionModal;
