import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteConversationMessages } from '../../api/messages';
import ModalContainer from '../ui/CustomModal';
import ModalBodyForDeleteConversation from '../ui/ModalBodyForDeleteConversation';
import ModalBodyForReport from '../ui/ModalBodyForReport';
import ModalBodyForBlockUser from '../ui/ModalBodyForBlockUser';

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
  const [reports, setReports] = useState<string>('');
  const [otherReport, setOtherReport] = useState('');
  const navigate = useNavigate();
  const [buttonDisabled, setButtonDisabled] = useState(true);
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
          />
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
