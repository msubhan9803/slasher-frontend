import React, {
  useState, useEffect,
} from 'react';
import { Modal } from 'react-bootstrap';
import { FormatMentionProps } from '../../routes/posts/create-post/CreatePost';
import { CommentValue, ContentDescription, ReplyValue } from '../../types';
import { decryptMessage } from '../../utils/text-utils';
import CreatePostComponent from './CreatePostComponent';
import ModalContainer from './CustomModal';

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
  deleteImageIds: string[];
  setDeleteImageIds: (val: string) => void;
  postImages: any;
  setPostImages: any;
  commentError: string[];
}

function EditCommentModal({
  showEdit, setShowEdit, commentID, commentReplyID, editContent, isReply,
  setCommentID, setCommentReplyID, addUpdateComment, addUpdateReply,
  deleteImageIds, setDeleteImageIds, postImages, setPostImages, commentError,
}: Props) {
  const [editMessage, setEditMessage] = useState<string>(editContent! || '');
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
  const [descriptionArray, setDescriptionArray] = useState<ContentDescription[]>([]);
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
  const onUpdatePost = (msg: string, imagesList: any, deleteImages: any) => {
    let mentionReplyString = '';
    if (isReply) {
      /* eslint no-useless-escape: 0 */
      setCommentReplyID(commentReplyID);
      setCommentID('');
      addUpdateReply({
        replyMessage: msg,
        replyId: commentReplyID,
        commentId: commentID,
        images: imagesList.filter((images: any) => images instanceof File),
        deleteImage: deleteImages,
        descriptionArr: descriptionArray,
      });
    } else {
      setCommentID(commentID);
      setCommentReplyID('');
      mentionReplyString = msg;
      addUpdateComment({
        commentMessage: mentionReplyString,
        commentId: commentID,
        images: postImages.filter((images: any) => images instanceof File),
        deleteImage: deleteImages,
        descriptionArr: descriptionArray,
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
  const handlePostComment = () => {
    const postContentWithMentionReplacements = (editMessage!.replace(/(?<!\S)@[a-zA-Z0-9_.-]+/g, mentionReplacementMatchFunc));
    const files = postImages.filter((images: any) => images instanceof File);
    onUpdatePost(postContentWithMentionReplacements, files, deleteImageIds);
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
        <CreatePostComponent
          setPostMessageContent={setEditMessage}
          errorMessage={commentError}
          createUpdatePost={handlePostComment}
          imageArray={postImages}
          setImageArray={setPostImages}
          defaultValue={decryptMessage(editMessage)}
          formatMention={formatMention}
          setFormatMention={setFormatMention}
          deleteImageIds={deleteImageIds}
          setDeleteImageIds={setDeleteImageIds}
          placeHolder={`${commentID ? 'Write a comment' : 'Reply to comment'}`}
          descriptionArray={descriptionArray}
          setDescriptionArray={setDescriptionArray}
          showSaveButton
          createEditPost
        />
      </Modal.Body>
    </ModalContainer>
  );
}

EditCommentModal.defaultProps = {
  editContent: '',
};

export default EditCommentModal;
