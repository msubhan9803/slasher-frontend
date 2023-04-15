import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import CustomModal from '../../../components/ui/CustomModal';
import RoundButton from '../../../components/ui/RoundButton';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  slectedDropdownValue: string
}

// TODO: Make the report modal to select only one option at a time like report modal used in
// ReportModal.tsx and ChatOptionsDialog.tsx file.
function DatingLikesDialog({ show, setShow, slectedDropdownValue }: Props) {
  const blockOptions = ['It’s inappropriate for Slasher', 'It’s fake or spam', 'Other'];
  const [reports, setReports] = useState<Set<string>>(new Set<string>());
  const [otherReport, setOtherReport] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const closeModal = () => {
    setShow(false);
    setButtonDisabled(true);
    setReports(new Set());
    setOtherReport('');
  };

  const reportChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    const newSet = new Set<string>(reports);
    if (checked) { newSet.add(value); } else { newSet.delete(value); }
    setReports(newSet);
    setButtonDisabled(false);

    if (!checked && new Set().size === 0) { setButtonDisabled(true); }
    if (checked && value === 'Other') { setButtonDisabled(true); }
  };
  const handleOtherReport = (other: any) => {
    setOtherReport(other.target.value);
    if (other.target.value === '') {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
  };

  return (
    <CustomModal
      show={show}
      centered
      onHide={closeModal}
      size="sm"
    >
      <Modal.Header className="border-0 shadow-none justify-content-end" closeButton />
      {slectedDropdownValue === '' && (
        <Modal.Body className="d-flex flex-column align-items-center text-center pb-5">
          <FontAwesomeIcon icon={solid('user-plus')} size="2x" className="border border-primary mb-4 rounded-5 text-primary" style={{ padding: '15px 12px' }} />
          <h3> Want to see who likes you?</h3>
          <Link to="/app/dating/likes" className="text-decoration-none text-primary">
            Click here
          </Link>
        </Modal.Body>
      )}
      {slectedDropdownValue === 'Unmatch' && (
        <Modal.Body className="d-flex flex-column align-items-center text-center p-4 pt-2">
          <h3 className="text-primary m-3 mt-0"> Ate you sure you want to unmatch? </h3>
          <RoundButton className="mb-3 w-100">Yes</RoundButton>
          <RoundButton className="mb-3 w-100 bg-dark border-dark shadow-none text-white" onClick={closeModal}>No</RoundButton>
        </Modal.Body>
      )}
      {slectedDropdownValue === 'Block user' && (
        <Modal.Body className="d-flex flex-column align-items-center text-center p-4 pt-2">
          <h3 className="text-primary m-3 mt-0"> Block this person? </h3>
          <p>You will no longer recieve messages from this contact.</p>
          <RoundButton className="mb-3 w-100">Yes, please block</RoundButton>
          <RoundButton className="mb-3 w-100 bg-dark border-dark shadow-none text-white" onClick={closeModal}>No, don’t block</RoundButton>
        </Modal.Body>
      )}
      {slectedDropdownValue === 'Report' && (
        <Modal.Body className="d-flex flex-column pt-2">
          <h3 className="text-primary mb-3 text-center"> Report </h3>
          <p>Why are you reporting this?</p>
          <Form className="mb-4">
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
                rows={5}
                as="textarea"
                value={otherReport}
                onChange={handleOtherReport}
                placeholder="Please describe the issue"
                className="mt-3"
              />
            )}
          </Form>
          <RoundButton disabled={buttonDisabled} className="mb-3 w-100">Send report</RoundButton>
          <RoundButton className="mb-3 w-100 bg-dark border-dark text-white" onClick={closeModal}>Cancel report</RoundButton>
        </Modal.Body>
      )}
    </CustomModal>
  );
}

export default DatingLikesDialog;
