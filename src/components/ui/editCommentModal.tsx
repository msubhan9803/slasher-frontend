import React, {
  useState, useEffect,
} from 'react';
import { Modal } from 'react-bootstrap';
import {
  CommentValue, ContentDescription, FormatMentionProps, ReplyValue,
} from '../../types';
import { atMentionsGlobalRegex, decryptMessage, generateMentionReplacementMatchFunc } from '../../utils/text-utils';
import CreatePostComponent from './CreatePostComponent';
import ModalContainer from './CustomModal';
import { ProgressButtonComponentType } from './ProgressButton';

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
  ProgressButton: ProgressButtonComponentType,
}

function EditCommentModal({
  showEdit, setShowEdit, commentID, commentReplyID, editContent, isReply,
  setCommentID, setCommentReplyID, addUpdateComment, addUpdateReply,
  deleteImageIds, setDeleteImageIds, postImages, setPostImages, commentError, ProgressButton,
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
  const handlePostComment = () => {
    const postContentWithMentionReplacements = (editMessage!.replace(
      atMentionsGlobalRegex,
      generateMentionReplacementMatchFunc(formatMention),
    ));
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
      enforceFocus={false}
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
          defaultValue={decryptMessage(editMessage, true, true)}
          formatMention={formatMention}
          setFormatMention={setFormatMention}
          deleteImageIds={deleteImageIds}
          setDeleteImageIds={setDeleteImageIds}
          placeHolder={`${commentID ? 'Write a comment' : 'Reply to comment'}`}
          descriptionArray={descriptionArray}
          setDescriptionArray={setDescriptionArray}
          ProgressButton={ProgressButton}
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
