import React, { useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import ModalContainer from './CustomModal';
import RoundButton from './RoundButton';
import { StyledTextarea } from './StyledTextarea';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  slectedDropdownValue: string;
  onConfirmClick?: () => void | undefined;
  onBlockYesClick?: () => void | undefined;
  handleReport?: (value: string) => void;
  removeComment?: () => void;
}
function ReportModal({
  show, setShow, slectedDropdownValue, onConfirmClick, onBlockYesClick,
  handleReport, removeComment,
}: Props) {
  const blockOptions = ['It’s inappropriate for Slasher', 'It’s fake or spam', 'Other'];
  const [reports, setReports] = useState<string>('');
  const [otherReport, setOtherReport] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [checked, setChecked] = useState(false);

  const closeModal = () => {
    setShow(false);
    setReports('');
    setButtonDisabled(true);
  };
  const removeData = () => {
    if (removeComment) { removeComment(); }
    if (onConfirmClick) { onConfirmClick(); }
    closeModal();
  };

  const reportChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setReports(value);
    setButtonDisabled(false);
  };

  const handleBlockUser = () => {
    if (onBlockYesClick) { onBlockYesClick(); }
    setChecked(false);
    closeModal();
  };

  const handleReportData = () => {
    const reason = reports === 'Other' ? otherReport : reports;
    if (reason) {
      if (handleReport) { handleReport(reason); }
    }
  };

  const postReportCloseClick = () => {
    if (checked) {
      handleBlockUser();
    } else {
      closeModal();
    }
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
          <p className="px-3">Are you sure you want to delete?</p>
          <RoundButton onClick={removeData} className="mb-3 w-100">Yes</RoundButton>
          <RoundButton className="mb-3 w-100 bg-dark border-dark text-white" onClick={closeModal}>Cancel</RoundButton>
        </Modal.Body>
      )}
      {
        slectedDropdownValue === 'Block user' && (
          <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
            <h1 className="h3 mb-0 text-primary">Block</h1>
            <p className="px-3">Are you sure you want to block this user?</p>
            <RoundButton className="mb-3 w-100 fs-3" onClick={handleBlockUser}>Yes</RoundButton>
            <RoundButton className="mb-3 w-100 bg-dark border-dark text-white fs-3" onClick={closeModal}>Cancel</RoundButton>
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
                  type="radio"
                  id={`report-${index}`}
                  checked={reports === label}
                  className="mb-2"
                  label={label}
                  value={label}
                  onChange={reportChangeHandler}
                />
              ))}
              {reports === 'Other' && (
                <Form.Control
                  rows={4}
                  as="textarea"
                  value={otherReport}
                  // onChange={reportChangeHandler}
                  onChange={(other) => setOtherReport(other.target.value)}
                  placeholder="Please describe the issue"
                  className="mt-3"
                  maxLength={1000}
                />
              )}
            </StyledTextarea>
            <RoundButton disabled={buttonDisabled} className="mb-3 w-100" onClick={handleReportData}>Send report</RoundButton>
            <RoundButton className="mb-3 w-100 bg-dark border-dark text-white" onClick={closeModal}>Cancel report</RoundButton>
          </Modal.Body>
        )
      }
      {
        slectedDropdownValue === 'PostReportSuccessDialog' && (
          <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
            <h1 className="h3 mb-0 text-primary pb-3">Block</h1>
            <p className="px-3">Thank you for your report. We will review it as soon as possible</p>

            <div className="d-flex pb-5">
              <div className="pe-3">
                Would you like to block this user?
              </div>
              <Form.Check
                type="checkbox"
                onChange={() => setChecked(!checked)}
                checked={checked}
              />

            </div>
            <RoundButton className="mb-3 w-100 fs-3" onClick={postReportCloseClick}>{checked ? 'Block and close' : 'Close'}</RoundButton>
          </Modal.Body>
        )
      }
    </ModalContainer>
  );
}
ReportModal.defaultProps = {
  onConfirmClick: undefined,
  onBlockYesClick: undefined,
  handleReport: undefined,
  removeComment: undefined,
};

export default ReportModal;
