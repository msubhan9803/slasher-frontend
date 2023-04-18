import React from 'react';
import { Modal } from 'react-bootstrap';
import CustomModal from '../../components/ui/CustomModal';
import RoundButton from '../../components/ui/RoundButton';
import { deleteConversationMessages } from '../../api/messages';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  slectedMessageDropdownValue: string
  selectedMatchListId: string
  setMessages: any;
}

function MessagesOptionDialog({
  show, setShow, slectedMessageDropdownValue, selectedMatchListId, setMessages,
}: Props) {
  const closeModal = () => {
    setShow(false);
  };

  const handleDeleteConversationMessages = () => {
    deleteConversationMessages(selectedMatchListId).then(() => {
      setShow(false);
      // Remove message of associated `matchList` without refetching converstaions
      setMessages((messages: any[]) => messages.filter(
        (message) => message._id !== selectedMatchListId,
      ));
    });
  };
  return (
    <CustomModal
      show={show}
      centered
      onHide={closeModal}
      size="sm"
    >
      {slectedMessageDropdownValue === 'Delete' && (
        <>
          <Modal.Header className="border-0" closeButton />
          <Modal.Body className="d-flex flex-column align-items-center text-center">
            <h1 className="text-primary"> Delete </h1>
            <p className="px-3">Are you sure you want to delete this conversation?</p>
            <RoundButton className="mb-3 w-100" onClick={handleDeleteConversationMessages}>Yes</RoundButton>
            <RoundButton className="mb-3 w-100 bg-dark border-dark text-white" onClick={closeModal}>Cancel</RoundButton>
          </Modal.Body>
        </>
      )}
      {slectedMessageDropdownValue === 'Block user' && (
        <>
          <Modal.Header className="border-0" closeButton />
          <Modal.Body className="d-flex flex-column align-items-center text-center">
            <h1 className="text-primary"> Block </h1>
            <p className="px-3">Are you sure you want to block this user?</p>
            <RoundButton className="mb-3 w-100">Yes</RoundButton>
            <RoundButton className="mb-3 w-100 bg-dark border-dark text-white" onClick={closeModal}>Cancel</RoundButton>
          </Modal.Body>
        </>
      )}
    </CustomModal>
  );
}

export default MessagesOptionDialog;
