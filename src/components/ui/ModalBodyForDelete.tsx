import React from 'react';
import { Modal } from 'react-bootstrap';
import RoundButton from './RoundButton';
import { ProgressButtonComponentType } from './ProgressButton';

interface DeleteUserModal {
  onConfirm: () => void;
  onCancel: () => void;
  ProgressButton?: ProgressButtonComponentType | any;
}

function ModalBodyForDelete({
  onConfirm, onCancel, ProgressButton,
}: DeleteUserModal) {
  return (
    <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
      <h1 className="h3 mb-0 text-primary">Delete</h1>
      <p className="px-3">
        Are you sure you want to delete?
      </p>
      <ProgressButton className="mb-3 w-100" onClick={onConfirm} label="Yes" />
      <RoundButton className="mb-3 w-100 bg-dark border-dark text-white" onClick={onCancel}>Cancel</RoundButton>
    </Modal.Body>
  );
}

ModalBodyForDelete.defaultProps = {
  ProgressButton: undefined,
};

export default ModalBodyForDelete;
