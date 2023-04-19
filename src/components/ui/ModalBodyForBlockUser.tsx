import React from 'react';
import { Modal } from 'react-bootstrap';
import RoundButton from './RoundButton';

interface BlockUserModal {
  onConfirm: () => void;
  onCancel: () => void;
}

function ModalBodyForBlockUser({ onConfirm, onCancel }: BlockUserModal) {
  return (
    <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
      <h1 className="h3 mb-0 text-primary">Block</h1>
      <p className="px-3">Are you sure you want to block this user?</p>
      <RoundButton className="mb-3 w-100" onClick={onConfirm}>Yes</RoundButton>
      <RoundButton className="mb-3 w-100 bg-dark border-dark text-white" onClick={onCancel}>Cancel</RoundButton>
    </Modal.Body>
  );
}

export default ModalBodyForBlockUser;
