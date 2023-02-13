import React, { useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteConversationMessages } from '../../api/messages';
import ModalContainer from '../ui/CustomModal';
import RoundButton from '../ui/RoundButton';
import { StyledTextarea } from '../ui/StyledTextarea';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  slectedDropdownValue: string;
  handleReport?: (value: string) => void;
  onBlockYesClick?: () => void | undefined;
}
function ChatOptionDialog({
  show, setShow, slectedDropdownValue, handleReport, onBlockYesClick,
}: Props) {
  const { conversationId } = useParams();
  const closeModal = () => {
    setShow(false);
  };
  const blockOptions = ['It’s inappropriate for Slasher', 'It’s fake or spam', 'Other'];
  const [reports, setReports] = useState<string>('');
  const [otherReport, setOtherReport] = useState('');
  const navigate = useNavigate();

  const reportChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setReports(value);
  };
  const handleReportData = () => {
    const reason = reports === 'Other' ? otherReport : reports;
    if (reason) {
      if (handleReport) { handleReport(reason); }
      closeModal();
    }
  };
  const handleClickModal = () => {
    if (onBlockYesClick) { onBlockYesClick(); }
    closeModal();
  };
  const handleDeleteConversationMessages = () => {
    if (!conversationId) { return; }
    deleteConversationMessages(conversationId).then(() => { setShow(false); navigate('/app/messages'); });
  };
  return (
    <ModalContainer
      show={show}
      centered
      onHide={closeModal}
      size="sm"
    >
      <Modal.Header className="border-0 shadow-none" closeButton />
      {slectedDropdownValue === 'Delete' && (
        <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
          <h1 className="h3 mb-0 text-primary">Delete</h1>
          <p className="px-3">Are you sure you want to delete this conversation?</p>
          <RoundButton className="mb-3 w-100" onClick={handleDeleteConversationMessages}>Yes</RoundButton>
          <RoundButton className="mb-3 w-100 bg-dark border-dark shadow-none text-white" onClick={closeModal}>Cancel</RoundButton>
        </Modal.Body>
      )}
      {slectedDropdownValue === 'Block user' && (
        <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
          <h1 className="h3 mb-0 text-primary">Block</h1>
          <p className="px-3">Are you sure you want to block this user?</p>
          <RoundButton className="mb-3 w-100" onClick={handleClickModal}>Yes</RoundButton>
          <RoundButton className="mb-3 w-100 bg-dark border-dark shadow-none text-white" onClick={closeModal}>Cancel</RoundButton>
        </Modal.Body>
      )}
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
            <RoundButton className="mb-3 w-100" onClick={handleReportData}>Send report</RoundButton>
            <RoundButton className="mb-3 w-100 bg-dark border-dark shadow-none text-white" onClick={closeModal}>Cancel report</RoundButton>
          </Modal.Body>
        )
      }
    </ModalContainer>
  );
}

ChatOptionDialog.defaultProps = {
  handleReport: undefined,
  onBlockYesClick: undefined,
};

export default ChatOptionDialog;
