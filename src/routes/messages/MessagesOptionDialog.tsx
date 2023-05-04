import React from 'react';
import { Modal } from 'react-bootstrap';
import CustomModal from '../../components/ui/CustomModal';
import { deleteConversationMessages } from '../../api/messages';
import ModalBodyForDeleteConversation from '../../components/ui/ModalBodyForDeleteConversation';
import ModalBodyForBlockUser from '../../components/ui/ModalBodyForBlockUser';

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
      <Modal.Header className="border-0 shadow-none justify-content-end" closeButton />
      {slectedMessageDropdownValue === 'Delete' && (
        <ModalBodyForDeleteConversation
          onConfirm={handleDeleteConversationMessages}
          onCancel={closeModal}
        />
      )}
      {slectedMessageDropdownValue === 'Block user' && (
        <ModalBodyForBlockUser
          onConfirm={() => { }}
          onCancel={closeModal}
        />
      )}
    </CustomModal>
  );
}

export default MessagesOptionDialog;
