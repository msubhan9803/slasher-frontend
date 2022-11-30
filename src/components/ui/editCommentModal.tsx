import React, {
  SyntheticEvent, useRef, useState, useEffect,
} from 'react';
import { Form, Modal } from 'react-bootstrap';
import ModalContainer from './CustomModal';
import RoundButton from './RoundButton';

const decryptMessage = (content: string) => {
  const found = content ? content.replace(/##LINK_ID##[a-fA-F0-9]{24}|##LINK_END##/g, '') : '';
  return found;
};

function EditCommentModal({
  showEdit, setShowEdit, commentID, commentReplyID, editContent, isReply,
  setCommentValue, setCommentID, setCommentReplyID,
}: any) {
  const textRef = useRef<any>();
  const [editMessage, setEditMessage] = useState<string>('');

  useEffect(() => {
    const editComment = decryptMessage(editContent);
    setEditMessage(editComment);
  }, []);

  const onChangeHandler = (e: SyntheticEvent) => {
    const target = e.target as HTMLTextAreaElement;
    setEditMessage(target.value);
    textRef.current.style.height = '36px';
    textRef.current.style.height = `${target.scrollHeight}px`;
    textRef.current.style.maxHeight = '100px';
  };

  const onUpdatePost = () => {
    if (isReply) {
      setCommentReplyID(commentReplyID);
      setCommentID('');
    } else {
      setCommentID(commentID);
      setCommentReplyID('');
    }
    setCommentValue(editMessage);
  };

  const closeModal = () => {
    setShowEdit(false);
  };

  return (
    <ModalContainer
      show={showEdit}
      centered
      onHide={closeModal}
      size="lg"
    >
      <Modal.Header className="bg-dark border-0 shadow-none justify-content-end" closeButton />
      <Modal.Body className="bg-dark d-flex flex-column pt-0">
        <h1 className="h1 mb-0 text-primary text-center pb-2">Edit</h1>
        <Form.Control
          placeholder="Write a comments"
          className="fs-5 border-end-0"
          rows={1}
          as="textarea"
          ref={textRef}
          defaultValue={editMessage}
          onChange={onChangeHandler}
        />
        <div className="d-flex flex-wrap justify-content-between">
          <RoundButton variant="black" className="px-4 mt-4" size="md" onClick={closeModal}>
            <span className="h3">Cancel</span>
          </RoundButton>
          <RoundButton className="px-4 mt-4" size="md" onClick={onUpdatePost}>
            <span className="h3">Update</span>
          </RoundButton>
        </div>
      </Modal.Body>
    </ModalContainer>
  );
}

export default EditCommentModal;
