import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteConversationMessages } from '../../api/messages';
import ModalContainer from '../ui/CustomModal';
import ModalBodyForDeleteConversation from '../ui/ModalBodyForDeleteConversation';
import ModalBodyForReport from '../ui/ModalBodyForReport';
import ModalBodyForBlockUser from '../ui/ModalBodyForBlockUser';
import ModalBodyForReportSuccess from '../ui/ModalBodyForReportSuccess';
import { ProgressButtonComponentType } from '../ui/ProgressButton';
import RoundButton from '../ui/RoundButton';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  slectedDropdownValue: string;
  handleReport?: (value: string) => void;
  onBlockYesClick?: () => void | undefined;
  ProgressButton: ProgressButtonComponentType;
}
function ChatOptionDialog({
  show, setShow, slectedDropdownValue, handleReport, onBlockYesClick, ProgressButton,
}: Props) {
  const { conversationId } = useParams();
  const [reports, setReports] = useState<string>('');
  const [otherReport, setOtherReport] = useState('');
  const navigate = useNavigate();
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [checked, setChecked] = useState(false);
  const closeModal = () => {
    setShow(false);
    setReports('');
    setButtonDisabled(true);
  };

  const reportChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setReports(value);
    setButtonDisabled(false);
  };
  const handleReportData = () => {
    const reason = reports === 'Other' ? otherReport : reports;
    if (reason) {
      if (handleReport) { handleReport(reason); }
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
  const handleBlockUser = () => {
    if (onBlockYesClick) { onBlockYesClick(); }
    setChecked(false);
  };
  const handleRedirect = () => {
    navigate('/app/home');
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
        <ModalBodyForDeleteConversation
          onConfirm={handleDeleteConversationMessages}
          onCancel={closeModal}
        />
      )}
      {slectedDropdownValue === 'Block user' && (
        <ModalBodyForBlockUser onConfirm={handleClickModal} onCancel={closeModal} />
      )}
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
            <RoundButton className="mb-3 w-100 fs-3" onClick={() => handleRedirect()}>Ok</RoundButton>
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
