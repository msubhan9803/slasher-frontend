import React, {
  useState, useEffect,
} from 'react';
import { Modal } from 'react-bootstrap';
import { FormatMentionProps } from '../../routes/posts/create-post/CreatePost';
import { CommentValue, ReplyValue } from '../../types';
import { decryptMessage } from '../../utils/text-utils';
import ModalContainer from './CustomModal';
import MessageTextarea, { MentionListProps } from './MessageTextarea';
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
  handleSearch: (val: string) => void;
  mentionList: MentionListProps[];
}

function EditCommentModal({
  showEdit, setShowEdit, commentID, commentReplyID, editContent, isReply,
  setCommentID, setCommentReplyID, addUpdateComment, addUpdateReply, handleSearch,
  mentionList,
}: Props) {
  const [editMessage, setEditMessage] = useState<string>(editContent! || '');
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
  useEffect(() => {
    if (editContent) {
      const mentionStringList = editContent.match(/##LINK_ID##[a-zA-Z0-9@_.-]+##LINK_END##/g);
      if (mentionStringList) {
        const finalFormatMentionList = Array.from(new Set(mentionStringList))
          .map((mentionString: string) => {
            const id = mentionString.match(/([a-f\d]{24})/g)![0];
            const value = mentionString.match(/(@[a-zA-Z0-9_.-]+)/g)![0].replace('@', '');
            return {
              id, value, format: mentionString,
            };
          });
        setFormatMention((prevMentions) => prevMentions.concat(finalFormatMentionList));
      }
    }
  }, [editContent]);
  const onUpdatePost = (msg: string) => {
    let mentionReplyString = '';
    if (isReply) {
      /* eslint no-useless-escape: 0 */
      setCommentReplyID(commentReplyID);
      setCommentID('');
      addUpdateReply({
        replyMessage: msg,
        replyId: commentReplyID,
        commentId: commentID,
      });
    } else {
      setCommentID(commentID);
      setCommentReplyID('');
      mentionReplyString = msg;
      addUpdateComment({
        commentMessage: mentionReplyString,
        commentId: commentID,
      });
    }
  };
  const mentionReplacementMatchFunc = (match: string) => {
    if (match) {
      const finalString: any = formatMention.find(
        (matchMention: FormatMentionProps) => match.includes(matchMention.value),
      );
      if (finalString) {
        return finalString.format;
      }
      return match;
    }
    return undefined;
  };
  const handleMessage = () => {
    const postContentWithMentionReplacements = (editMessage!.replace(/(?<!\S)@[a-zA-Z0-9_.-]+/g, mentionReplacementMatchFunc));
    onUpdatePost(postContentWithMentionReplacements);
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
        <MessageTextarea
          rows={10}
          placeholder="Write a comments"
          handleSearch={handleSearch}
          mentionLists={mentionList}
          setMessageContent={setEditMessage}
          formatMentionList={formatMention}
          setFormatMentionList={setFormatMention}
          defaultValue={decryptMessage(editMessage)}
        />
        <div className="d-flex flex-wrap justify-content-between">
          <RoundButton variant="black" className="px-4 mt-4" size="md" onClick={closeModal}>
            <span className="h3">Cancel</span>
          </RoundButton>
          <RoundButton className="px-4 mt-4" size="md" onClick={handleMessage}>
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
