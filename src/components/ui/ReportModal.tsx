import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import ModalContainer from './CustomModal';
import ModalBodyForReport from './ModalBodyForReport';
import ModalBodyForBlockUser from './ModalBodyForBlockUser';
import ModalBodyForDelete from './ModalBodyForDelete';
import ModalBodyForReportSuccess from './ModalBodyForReportSuccess';
import RoundButton from './RoundButton';
import ModalBodyForRemoveFriend from './ModalBodyForRemoveFreind';
import { ProgressButtonComponentType } from './ProgressButton';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  slectedDropdownValue: string;
  onConfirmClickAsync?: () => any;
  onBlockYesClick?: () => void | undefined;
  handleReport?: (value: string,) => void;
  removeCommentAsync?: () => Promise<void>;
  rssfeedProviderId?: string;
  afterBlockUser?: () => void;
  setDropDownValue?: (value: string) => void;
  ProgressButton?: ProgressButtonComponentType;
}
function ReportModal({
  show, setShow, slectedDropdownValue, onConfirmClickAsync, onBlockYesClick,
  handleReport, removeCommentAsync, rssfeedProviderId,
  afterBlockUser, setDropDownValue, ProgressButton,
}: Props) {
  const [reports, setReports] = useState<string>('');
  const [otherReport, setOtherReport] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [checked, setChecked] = useState(false);

  const closeModal = () => {
    if (slectedDropdownValue === 'BlockUserSuccess') {
      afterBlockUser!();
    }
    if (setDropDownValue) {
      setDropDownValue('');
    }
    setShow(false);
    setReports('');
    setButtonDisabled(true);
    setOtherReport('');
    setChecked(false);
  };
  const handleDelete = async () => {
    try {
      if (removeCommentAsync) { await removeCommentAsync(); }
      if (onConfirmClickAsync) { await onConfirmClickAsync(); }
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(`Error name: ${error.name}, message: ${error.message}`);
    } finally { closeModal(); }
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

  const onOkClick = () => {
    if (afterBlockUser) {
      afterBlockUser();
    }

    if (setDropDownValue) {
      setDropDownValue('');
      setShow(false);
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
            onConfirm={handleDelete}
            onCancel={closeModal}
            ProgressButton={ProgressButton}
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
            ProgressButton={ProgressButton}
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
            ProgressButton={ProgressButton}
          />
        )
      }
      {
        slectedDropdownValue === 'BlockUserSuccess' && (
          <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
            <p className="px-3">You have successfully blocked this user.</p>
            <RoundButton className="mb-3 w-100 fs-3" onClick={() => onOkClick()}>Ok</RoundButton>
          </Modal.Body>
        )
      }
      {
        slectedDropdownValue === 'Remove friend' && (
          <ModalBodyForRemoveFriend
            onConfirm={onConfirmClickAsync as any}
            onCancel={closeModal}
            ProgressButton={ProgressButton}
          />
        )
      }
    </ModalContainer>
  );
}
ReportModal.defaultProps = {
  onConfirmClickAsync: undefined,
  onBlockYesClick: undefined,
  handleReport: undefined,
  removeCommentAsync: undefined,
  rssfeedProviderId: undefined,
  afterBlockUser: undefined,
  setDropDownValue: undefined,
  ProgressButton: undefined,
};

export default ReportModal;
