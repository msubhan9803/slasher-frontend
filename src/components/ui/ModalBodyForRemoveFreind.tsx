import React from 'react';
import { Modal } from 'react-bootstrap';
import RoundButton from './RoundButton';
import { ProgressButtonComponentType } from './ProgressButton';

interface RemoveUserModal {
  onConfirm: () => void;
  onCancel: () => void;
  ProgressButton?: ProgressButtonComponentType | any;
}

function ModalBodyForRemoveFriend({
  onConfirm, onCancel, ProgressButton,
}: RemoveUserModal) {
  return (
    <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
      <h1 className="h3 mb-0 text-primary">Remove</h1>
      <p className="px-3">Are you sure you’d like to remove this friend?</p>
      <ProgressButton className="mb-3 w-100" onClick={onConfirm} label="Yes" />
      <RoundButton className="mb-3 w-100 bg-dark border-dark text-white" onClick={onCancel}>Cancel</RoundButton>
    </Modal.Body>
  );
}

ModalBodyForRemoveFriend.defaultProps = {
  ProgressButton: undefined,
};

export default ModalBodyForRemoveFriend;
