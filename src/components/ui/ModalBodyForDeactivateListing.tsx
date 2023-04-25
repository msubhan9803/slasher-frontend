import React from 'react';
import { Modal } from 'react-bootstrap';
import RoundButton from './RoundButton';

interface DeactivateListing {
  onCancel: () => void;
  onConfirm: (val: boolean) => void;
  setShow: (val: boolean) => void;
}

function ModalBodyForDeactivateListing({ onCancel, onConfirm, setShow }: DeactivateListing) {
  return (
    <Modal.Body className="d-flex flex-column align-items-center text-center pb-5">
      <div className="px-5">
        <h1 className="text-primary h2">Deactivate listing </h1>
        <p className="h5 px-4">Are you sure you want to deactivate your listing?</p>
      </div>
      <RoundButton onClick={onCancel} className="mt-3 w-100 border-0 bg-dark text-white fw-bold">
        No, do not deactivate
      </RoundButton>
      <RoundButton onClick={() => { onConfirm(true); setShow(false); }} className="mt-3 w-100 border-0 bg-dark text-white fw-bold">
        Yes, please deactivate my listing
      </RoundButton>
    </Modal.Body>
  );
}

export default ModalBodyForDeactivateListing;
