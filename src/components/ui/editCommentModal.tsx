import React, {
  SyntheticEvent, useRef, useState, useEffect,
} from 'react';
import { Form, Modal } from 'react-bootstrap';
import { CommentValue, ReplyValue } from '../../types';
import ModalContainer from './CustomModal';
import RoundButton from './RoundButton';

interface Props {
  showEdit: boolean;
  setShowEdit: (value: boolean) => void;
  commentID: string;
  commentReplyID: string;
  editContent?: string;
  isReply: boolean;
  addUpdateComment: (value: CommentValue) => void;
  addUpdateReply: (value: ReplyValue) => void;
  setCommentID: (value: string) => void;
  setCommentReplyID: (value: string) => void;
}

const decryptMessage = (content: any) => {
  const found = content ? content.replace(/##LINK_ID##[a-fA-F0-9]{24}|##LINK_END##/g, '') : '';
  return found;
};

function EditCommentModal({
  showEdit, setShowEdit, commentID, commentReplyID, editContent, isReply,
  setCommentID, setCommentReplyID, addUpdateComment, addUpdateReply,
}: Props) {
  const textRef = useRef<any>();
  const [editMessage, setEditMessage] = useState<any>('');

  useEffect(() => {
    const editComment = decryptMessage(editContent);
    setEditMessage(editComment);
  }, [editContent]);

  const onChangeHandler = (e: SyntheticEvent) => {
    const target = e.target as HTMLTextAreaElement;
    setEditMessage(target.value);
  };

  const onUpdatePost = () => {
    let mentionReplyString = '';
    if (isReply) {
      /* eslint no-useless-escape: 0 */
      const getMentionUser = editMessage.match(/\@[a-zA-Z0-9_.-]+/g)[0];
      setCommentReplyID(commentReplyID);
      setCommentID('');
      mentionReplyString = editMessage.replace(getMentionUser, `##LINK_ID##${commentReplyID}${getMentionUser}##LINK_END##`);
      addUpdateReply({
        replyMessage: mentionReplyString,
        replyId: commentReplyID,
        commentId: commentID,
      });
    } else {
      setCommentID(commentID);
      setCommentReplyID('');
      mentionReplyString = editMessage;
      addUpdateComment({
        commentMessage: mentionReplyString,
        commentId: commentID,
      });
    }
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
          className="bg-black fs-5"
          rows={10}
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

EditCommentModal.defaultProps = {
  editContent: '',
};

export default EditCommentModal;
