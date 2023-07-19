import React from 'react';
import { Modal } from 'react-bootstrap';
import RoundButton from './RoundButton';

interface RemoveUserModal {
  onConfirm: (() => void | undefined) | undefined;
  onCancel: () => void;
}

function ModalBodyForRemoveFriend({
  onConfirm, onCancel,
}: RemoveUserModal) {
  return (
    <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
      <h1 className="h3 mb-0 text-primary">Remove</h1>
      <p className="px-3">Are you sure you’d like to remove this friend?</p>
      <RoundButton className="mb-3 w-100" onClick={onConfirm}>Yes</RoundButton>
      <RoundButton className="mb-3 w-100 bg-dark border-dark text-white" onClick={onCancel}>Cancel</RoundButton>
    </Modal.Body>
  );
}

export default ModalBodyForRemoveFriend;
