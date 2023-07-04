import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import CreatePostComponent from '../CreatePostComponent';
import ModalContainer from '../CustomModal';
import { atMentionsGlobalRegex, decryptMessage, generateMentionReplacementMatchFunc } from '../../../utils/text-utils';
import { ContentDescription, FormatMentionProps } from '../../../types';
import { ProgressButtonComponentType } from '../ProgressButton';

interface Props {
  show: boolean;
  errorMessage: string[];
  setShow: (value: boolean) => void;
  setPostContent: (val: string) => void;
  postContent: string;
  ProgressButton: ProgressButtonComponentType,
  onUpdatePost: (
    value: string,
    images: string[],
    deleteImageIds: string[] | undefined,
    descriptionArray?: ContentDescription[]) => void;
  postImages: string[];
  setPostImages: any;
  deleteImageIds?: string[];
  setDeleteImageIds?: (val: string) => void;
  editPost?: boolean;
}
function EditPostModal({
  show,
  errorMessage,
  setShow,
  setPostContent,
  postContent,
  onUpdatePost,
  postImages,
  setPostImages,
  deleteImageIds,
  setDeleteImageIds,
  editPost,
  ProgressButton,
}: Props) {
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
  const [descriptionArray, setDescriptionArray] = useState<ContentDescription[]>([]);
  useEffect(() => {
    if (postContent) {
      const mentionStringList = postContent.match(/##LINK_ID##[a-zA-Z0-9@_.-]+##LINK_END##/g);
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
  }, [postContent]);
  const closeModal = () => {
    setShow(false);
  };
  const updatePost = () => {
    const postContentWithMentionReplacements = (postContent.replace(
      atMentionsGlobalRegex,
      generateMentionReplacementMatchFunc(formatMention),
    ));
    const files = postImages.filter((images: any) => images instanceof File);
    onUpdatePost(postContentWithMentionReplacements, files, deleteImageIds, descriptionArray);
  };
  return (
    <ModalContainer
      show={show}
      centered
      onHide={closeModal}
      size="lg"
    >
      <Modal.Header className="bg-dark border-0 shadow-none justify-content-end" closeButton />
      <Modal.Body className="bg-dark d-flex flex-column pt-0">
        <h1 className="h1 mb-0 text-primary text-center pb-2">Edit</h1>
        <CreatePostComponent
          setPostMessageContent={setPostContent}
          errorMessage={errorMessage}
          createUpdatePost={updatePost}
          imageArray={postImages}
          setImageArray={setPostImages}
          defaultValue={decryptMessage(postContent, true)}
          formatMention={formatMention}
          setFormatMention={setFormatMention}
          deleteImageIds={deleteImageIds}
          setDeleteImageIds={setDeleteImageIds}
          placeHolder="Create a post"
          MaxImageUserInfo="Up to 10"
          showSaveButton
          descriptionArray={descriptionArray}
          setDescriptionArray={setDescriptionArray}
          createEditPost={editPost}
          ProgressButton={ProgressButton}
        />
      </Modal.Body>
    </ModalContainer>
  );
}
EditPostModal.defaultProps = {
  deleteImageIds: [],
  setDeleteImageIds: undefined,
  editPost: undefined,
};
export default EditPostModal;
