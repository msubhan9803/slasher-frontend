import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import ModalContainer from './CustomModal';
import ModalBodyForReport from './ModalBodyForReport';
import ModalBodyForBlockUser from './ModalBodyForBlockUser';
import ModalBodyForDelete from './ModalBodyForDelete';
import ModalBodyForReportSuccess from './ModalBodyForReportSuccess';
import RoundButton from './RoundButton';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  slectedDropdownValue: string;
  onConfirmClick?: () => void | undefined;
  onBlockYesClick?: () => void | undefined;
  handleReport?: (value: string,) => void;
  removeComment?: () => void;
  rssfeedProviderId?: string;
  afterBlockUser?: Function;
}
function ReportModal({
  show, setShow, slectedDropdownValue, onConfirmClick, onBlockYesClick,
  handleReport, removeComment, rssfeedProviderId,
  afterBlockUser,
}: Props) {
  const [reports, setReports] = useState<string>('');
  const [otherReport, setOtherReport] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [checked, setChecked] = useState(false);

  const closeModal = () => {
    setShow(false);
    setReports('');
    setButtonDisabled(true);
    setOtherReport('');
    setChecked(false);
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
  };

  const handleReportData = () => {
    const reason = reports === 'Other' ? otherReport : reports;
    if (reason) {
      if (handleReport) { handleReport(reason); setOtherReport(''); }
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
      {(
        slectedDropdownValue === 'Delete' || slectedDropdownValue === 'Delete Review')
        && (
          <ModalBodyForDelete
            onConfirm={removeData}
            onCancel={closeModal}
          />
        )}
      {
        slectedDropdownValue === 'Block user' && (
          <ModalBodyForBlockUser
            onConfirm={handleBlockUser}
            onCancel={closeModal}
          />
        )
      }
      {
        slectedDropdownValue === 'Report' && (
          <ModalBodyForReport
            report={reports}
            otherReport={otherReport}
            onReportChange={reportChangeHandler}
            setOtherReport={setOtherReport}
            onConfirm={handleReportData}
            onCancel={closeModal}
            buttonDisabled={buttonDisabled}
          />
        )
      }
      {
        slectedDropdownValue === 'PostReportSuccessDialog' && (
          <ModalBodyForReportSuccess
            rssfeedProviderId={rssfeedProviderId}
            checked={checked}
            setChecked={setChecked}
            closeModal={closeModal}
            handleBlockUser={handleBlockUser}
          />
        )
      }
      {
        slectedDropdownValue === 'BlockUserSuccess' && (
          <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
            <p className="px-3">You have successfully blocked this user.</p>
            <RoundButton className="mb-3 w-100 fs-3" onClick={afterBlockUser}>Ok</RoundButton>
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
  rssfeedProviderId: undefined,
  afterBlockUser: () => { },
};

export default ReportModal;
