import React from 'react';
import { Modal } from 'react-bootstrap';
import CustomModal from './CustomModal';
import RoundButton from './RoundButton';

export default function CheckCommentModal({
  commentNotFound, setCommentNotFound, onCommentNotFoundClose, content,
}: any) {
  return (
    <div>
      <CustomModal show={commentNotFound} centered size="sm" onHide={() => setCommentNotFound(false)}>
        <Modal.Header className="border-0 shadow-none justify-content-end" />
        <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
          <p className="px-3">{content}</p>
          <RoundButton variant="primary" className="w-100 mt-4 mb-3 " onClick={() => { onCommentNotFoundClose(); }}>Ok</RoundButton>
        </Modal.Body>
      </CustomModal>
    </div>
  );
}
