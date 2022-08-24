import React from 'react';
import { Modal } from 'react-bootstrap';
import CustomModal from '../../components/ui/CustomModal';
import RoundButton from '../../components/ui/RoundButton';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  slectedMessageDropdownValue: string
}

function MessagesOptionDialog({ show, setShow, slectedMessageDropdownValue }: Props) {
  const closeModal = () => {
    setShow(false);
  };
  return (
    <CustomModal
      show={show}
      centered
      onHide={closeModal}
      size="sm"
    >
      {slectedMessageDropdownValue === 'delete' && (
        <>
          <Modal.Header className="border-0 shadow-none" closeButton />
          <Modal.Body className="d-flex flex-column align-items-center text-center">
            <h1 className="text-primary"> Delete </h1>
            <p className="px-3">Are you sure you want to delete this conversation?</p>
            <RoundButton className="mb-3 w-100">Yes</RoundButton>
            <RoundButton className="mb-3 w-100 bg-dark border-dark shadow-none" onClick={closeModal}>Cancel</RoundButton>
          </Modal.Body>
        </>
      )}
      {slectedMessageDropdownValue === 'blockUser' && (
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
    </CustomModal>
  );
}

export default MessagesOptionDialog;
