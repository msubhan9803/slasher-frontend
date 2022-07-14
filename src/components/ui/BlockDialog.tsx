import React from 'react';
import { Modal } from 'react-bootstrap';
import RoundButton from './RoundButton';
import ModalContainer from './CustomModal';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  slectedDropdownValue: string
}

function BlockDialog({ show, setShow, slectedDropdownValue }: Props) {
  const closeModal = () => {
    setShow(false);
  };
  return (
    <ModalContainer
      show={show}
      centered
      onHide={closeModal}
      size="sm"
    >
      {slectedDropdownValue === 'block' && (
        <>
          <Modal.Header className="border-0 shadow-none" closeButton />
          <Modal.Body className="d-flex flex-column align-items-center text-center">
            <h1 className="text-primary"> Block </h1>
            <p className="px-3">Are you sure you want to block this user?</p>
            <RoundButton className="mb-3 w-100">Yes</RoundButton>
            <RoundButton className="mb-3 w-100 bg-dark border-dark shadow-none" onClick={closeModal}>Cancel</RoundButton>
          </Modal.Body>
        </>
      )}
    </ModalContainer>
  );
}

export default BlockDialog;
