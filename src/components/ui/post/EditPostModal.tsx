import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FormatMentionProps } from '../../../routes/posts/create-post/CreatePost';
import CreatePostComponent from '../CreatePostComponent';
import ModalContainer from '../CustomModal';
import { decryptMessage } from '../../../utils/text-utils';

interface Props {
  show: boolean;
  errorMessage: string[];
  setShow: (value: boolean) => void;
  setPostContent: (val: string) => void;
  postContent: string;
  onUpdatePost: (value: string, images: string[], deleteImageIds: string[] | undefined) => void;
  postImages: string[];
  setPostImages: any;
  deleteImageIds?: string[];
  setDeleteImageIds?: (val: string) => void;
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
}: Props) {
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
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
  const mentionReplacementMatchFunc = (match: string) => {
    if (match && formatMention) {
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
  const updatePost = () => {
    const postContentWithMentionReplacements = (postContent.replace(/(?<!\S)@[a-zA-Z0-9_.-]+/g, mentionReplacementMatchFunc));
    const files = postImages.filter((images: any) => images instanceof File);
    onUpdatePost(postContentWithMentionReplacements, files, deleteImageIds);
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
          defaultValue={decryptMessage(postContent)}
          formatMention={formatMention}
          setFormatMention={setFormatMention}
          deleteImageIds={deleteImageIds}
          setDeleteImageIds={setDeleteImageIds}
        />
      </Modal.Body>
    </ModalContainer>
  );
}
EditPostModal.defaultProps = {
  deleteImageIds: [],
  setDeleteImageIds: undefined,
};
export default EditPostModal;
