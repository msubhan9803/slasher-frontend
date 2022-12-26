import React, { useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import ModalContainer from './CustomModal';
import RoundButton from './RoundButton';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  slectedDropdownValue: string;
  onConfirmClick?: () => void | undefined;
  deleteText?: string;
  setDeleteComment?: (value: boolean) => void;
  setDeleteCommentReply?: (value: boolean) => void;
  onBlockYesClick?: () => void | undefined;
}
const StyledTextarea = styled(Form)`
  .form-control {
    resize: none;
  }
`;
function ReportModal({
  show, setShow, slectedDropdownValue, setDeleteComment,
  setDeleteCommentReply, onConfirmClick, deleteText, onBlockYesClick,
}: Props) {
  const blockOptions = ['It’s inappropriate for Slasher', 'It’s fake or spam', 'Other'];
  const [reports, setReports] = useState<Set<string>>(new Set<string>());
  const [otherReport, setOtherReport] = useState('');

  const closeModal = () => {
    setShow(false);
  };
  const removeData = () => {
    if (setDeleteComment) setDeleteComment(true);
    if (setDeleteCommentReply) setDeleteCommentReply(true);
    if (onConfirmClick) onConfirmClick();
    closeModal();
  };

  const reportChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    const newSet = new Set<string>(reports);
    if (checked) { newSet.add(value); } else { newSet.delete(value); }
    setReports(newSet);
  };

  const handleClickModal = () => {
    if (onBlockYesClick) onBlockYesClick();
    closeModal();
  };

  return (
    <ModalContainer
      show={show}
      centered
      onHide={closeModal}
      size="sm"
    >
      <Modal.Header className="border-0 shadow-none justify-content-end" closeButton />
      {slectedDropdownValue === 'Delete' && (
        <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
          <h1 className="h3 mb-0 text-primary">Delete</h1>
          <p className="px-3">{deleteText}</p>
          <RoundButton onClick={removeData} className="mb-3 w-100">Yes</RoundButton>
          <RoundButton className="mb-3 w-100 bg-dark border-dark shadow-none text-white" onClick={closeModal}>Cancel</RoundButton>
        </Modal.Body>
      )}
      {
        slectedDropdownValue === 'Block user' && (
          <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
            <h1 className="h3 mb-0 text-primary">Block</h1>
            <p className="px-3">Are you sure you want to block this user?</p>
            <RoundButton className="mb-3 w-100 fs-3" onClick={handleClickModal}>Yes</RoundButton>
            <RoundButton className="mb-3 w-100 bg-dark border-dark shadow-none text-white fs-3" onClick={closeModal}>Cancel</RoundButton>
          </Modal.Body>
        )
      }
      {
        slectedDropdownValue === 'Report' && (
          <Modal.Body className="d-flex flex-column pt-0">
            <h3 className="h3 mb-0 text-primary text-center">Report</h3>
            <p className="px-3 text-center mb-4">Why are you reporting this?</p>
            <StyledTextarea className="mb-4">
              {blockOptions.map((label: string, index: number) => (
                <Form.Check
                  key={label}
                  type="checkbox"
                  id={`report-${index}`}
                  checked={reports.has(label)}
                  className="mb-2"
                  label={label}
                  value={label}
                  onChange={reportChangeHandler}
                />
              ))}
              {reports.has('Other') && (
                <Form.Control
                  rows={4}
                  as="textarea"
                  value={otherReport}
                  onChange={(other) => setOtherReport(other.target.value)}
                  placeholder="Please describe the issue"
                  className="mt-3"
                />
              )}
            </StyledTextarea>
            <RoundButton className="mb-3 w-100">Send report</RoundButton>
            <RoundButton className="mb-3 w-100 bg-dark border-dark shadow-none text-white" onClick={closeModal}>Cancel report</RoundButton>
          </Modal.Body>
        )
      }
    </ModalContainer>
  );
}
ReportModal.defaultProps = {
  onConfirmClick: undefined,
  deleteText: 'Are you sure you want to delete?',
  setDeleteComment: () => { },
  setDeleteCommentReply: () => { },
  onBlockYesClick: undefined,
};

export default ReportModal;
