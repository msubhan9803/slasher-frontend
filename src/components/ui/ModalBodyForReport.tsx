import React from 'react';
import { Form, Modal } from 'react-bootstrap';
import RoundButton from './RoundButton';
import { StyledTextarea } from './StyledTextarea';

interface ReportModal {
  report: string | Set<string>;
  otherReport: string;
  onReportChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setOtherReport: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  buttonDisabled: boolean;
}

function ModalBodyForReport({
  report, otherReport, onReportChange,
  setOtherReport, onConfirm, onCancel, buttonDisabled,
}: ReportModal) {
  const blockOptions = ['It’s inappropriate for Slasher', 'It’s fake or spam', 'Other'];

  return (
    <Modal.Body className="d-flex flex-column pt-0">
      <h3 className="h3 mb-0 text-primary text-center">Report</h3>
      <p className="px-3 text-center mb-4">Why are you reporting this?</p>
      <StyledTextarea className="mb-4">
        {blockOptions.map((label: string, index: number) => (
          <Form.Check
            key={label}
            type="radio"
            id={`report-${index}`}
            checked={report === label}
            className="mb-2"
            label={label}
            value={label}
            onChange={onReportChange}
          />
        ))}
        {report === 'Other' && (
          <Form.Control
            rows={4}
            as="textarea"
            value={otherReport}
            onChange={(other) => setOtherReport(other.target.value)}
            placeholder="Please describe the issue"
            className="mt-3"
            maxLength={1000}
          />
        )}
      </StyledTextarea>
      <RoundButton disabled={buttonDisabled} className="mb-3 w-100" onClick={onConfirm}>Send report</RoundButton>
      <RoundButton className="mb-3 w-100 bg-dark border-dark text-white" onClick={onCancel}>Cancel report</RoundButton>
    </Modal.Body>
  );
}

export default ModalBodyForReport;
