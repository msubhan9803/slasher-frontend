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

function DatingLikesDialog({ show, setShow, slectedDropdownValue }: Props) {
  const closeModal = () => {
    setShow(false);
  };
  const blockOptions = ['Inappropriate profile', 'Fake photo', 'Spam', 'Other'];
  const [reports, setReports] = useState<Set<string>>(new Set<string>());
  const [otherReport, setOtherReport] = useState('');

  const reportChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    const newSet = new Set<string>(reports);
    if (checked) { newSet.add(value); } else { newSet.delete(value); }
    setReports(newSet);
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
          <Link to="/dating/likes" className="text-decoration-none text-primary">
            Click here
          </Link>
        </Modal.Body>
      )}
      {slectedDropdownValue === 'Unmatch' && (
        <Modal.Body className="d-flex flex-column align-items-center text-center p-4 pt-2">
          <h3 className="text-primary m-3 mt-0"> Are you sure you want to unmatch? </h3>
          <RoundButton className="mb-3 w-100">Yes</RoundButton>
          <RoundButton className="mb-3 w-100 bg-dark border-dark shadow-none text-white" onClick={closeModal}>No</RoundButton>
        </Modal.Body>
      )}
      {slectedDropdownValue === 'Block & Report' && (
        <Modal.Body className="d-flex flex-column pt-2">
          <h3 className="text-primary mb-3 text-center"> Block &#38; Report </h3>
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
                onChange={(other) => setOtherReport(other.target.value)}
                placeholder="Describe the issue."
                className="mt-3"
              />
            )}
          </Form>
          <RoundButton className="mb-3 w-100">Yes</RoundButton>
          <RoundButton className="mb-3 w-100 bg-dark border-dark shadow-none text-white" onClick={closeModal}>No</RoundButton>
        </Modal.Body>
      )}
    </CustomModal>
  );
}

export default DatingLikesDialog;
