import React from 'react';
import { Modal } from 'react-bootstrap';
import ModalContainer from './CustomModal';
import MessageTextarea, { FormatMentionListProps, MentionListProps } from './MessageTextarea';
import RoundButton from './RoundButton';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  handleSearch: (val: string) => void;
  mentionList: MentionListProps[];
  setPostContent: (val: string) => void;
  formatMention: FormatMentionListProps[];
  setFormatMention: (val: FormatMentionListProps[]) => void;
  content: string;
}

function EditPostModal({
  show,
  setShow,
  handleSearch,
  mentionList,
  setPostContent,
  formatMention,
  setFormatMention,
  content,
}: Props) {
  const closeModal = () => {
    setShow(false);
  };

  return (
    <ModalContainer
      show={show}
      centered
      onHide={closeModal}
      size="lg"
    >
      <Modal.Header className="bg-dark border-0 shadow-none justify-content-end" closeButton />
      <Modal.Body className="bg-dark d-flex flex-column align-items-center text-center pt-0">
        <h1 className="h3 mb-0 text-primary">Edit</h1>
        <MessageTextarea
          rows={10}
          placeholder="Create a post"
          handleSearch={handleSearch}
          mentionLists={mentionList}
          setMessageContent={setPostContent}
          formatMentionList={formatMention}
          setFormatMentionList={setFormatMention}
          defaultValue={content}
        />
        <div className="d-flex flex-wrap">
          <RoundButton className="px-4 mt-4 w-100" size="md" onClick={closeModal}>
            <span className="h3">Cancel</span>
          </RoundButton>
          <RoundButton className="px-4 mt-4 w-100" size="md">
            <span className="h3">Update</span>
          </RoundButton>
        </div>
      </Modal.Body>
    </ModalContainer>
  );
}

export default EditPostModal;
