import React, { useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import RoundButton from './RoundButton';
import ModalContainer from './CustomModal';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  slectedDropdownValue: string
}

function ReportDialog({ show, setShow, slectedDropdownValue }: Props) {
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
    <ModalContainer
      show={show}
      centered
      onHide={closeModal}
    >
      {slectedDropdownValue === 'report' && (
        <>
          <Modal.Header className="border-0 shadow-none" closeButton />
          <Modal.Body className="d-flex flex-column p-5 pt-4">
            <h3 className="text-primary mb-3 text-center"> Block &#38; Report </h3>
            <Form className="mb-4">
              {blockOptions.map((report: string, index: number) => (
                <Form.Check
                  key={report}
                  type="checkbox"
                  id={`report-${index}`}
                  checked={reports.has(report)}
                  className="mb-2"
                  label={report}
                  value={report}
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
            <RoundButton className="mb-3 w-100 bg-dark border-dark shadow-none" onClick={closeModal}>No</RoundButton>
          </Modal.Body>
        </>
      )}
    </ModalContainer>
  );
}

export default ReportDialog;
