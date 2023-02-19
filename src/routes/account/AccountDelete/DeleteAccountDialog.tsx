import React from 'react';
import { Modal } from 'react-bootstrap';
import styled from 'styled-components';
import ModalContainer from '../../../components/ui/CustomModal';
import RoundButton from '../../../components/ui/RoundButton';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  onDeleteClick?: () => void | undefined;
}
const CustomRoundButton = styled(RoundButton)`
  display: inline-block;
  white-space: nowrap;
  border: 1px solid #3A3B46;
  &:hover {
  border: 1px solid #3A3B46;
}
`;
function DeleteAccountDialog({ show, setShow, onDeleteClick }: Props) {
  const closeModal = () => {
    setShow(false);
  };

  const handleConfirmBox = () => {
    closeModal();
  };
  return (
    <ModalContainer
      show={show}
      centered
      onHide={closeModal}
      size="sm"
    >
      <Modal.Header className="border-0 shadow-none justify-content-end p-4" closeButton />
      <Modal.Body className="d-flex flex-column align-items-center text-center pt-0 p-4">
        <h1 className="h2 mb-0 text-primary">Delete account</h1>
        <p className="px-3 fs-4">Are you sure you want to delete your account?</p>
        <CustomRoundButton className="bg-dark h-3 w-100 text-center text-white px-2 my-3" onClick={closeModal}>
          No, do not delete
        </CustomRoundButton>
        <CustomRoundButton className="bg-dark h-3 w-100 text-center text-white px-2" onClick={() => { handleConfirmBox(); if (onDeleteClick) { onDeleteClick(); } }}>Yes, please delete my account</CustomRoundButton>
      </Modal.Body>
    </ModalContainer>
  );
}
DeleteAccountDialog.defaultProps = {
  onDeleteClick: undefined,
};

export default DeleteAccountDialog;
