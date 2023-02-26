import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FormatMentionProps } from '../../../routes/posts/create-post/CreatePost';
import MessageTextarea, { MentionListProps } from '../MessageTextarea';
import RoundButton from '../RoundButton';
import ModalContainer from '../CustomModal';
import { decryptMessage } from '../../../utils/text-utils';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  handleSearch: (val: string) => void;
  mentionList: MentionListProps[];
  setPostContent: (val: string) => void;
  postContent: string;
  onUpdatePost: (value: string) => void;
}
function EditPostModal({
  show,
  setShow,
  handleSearch,
  mentionList,
  setPostContent,
  postContent,
  onUpdatePost,
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
    if (match) {
      const finalString: any = formatMention.find(
        (matchMention: FormatMentionProps) => match.includes(matchMention.value),
      );
      return finalString.format;
    }
    return undefined;
  };
  const handleMessage = () => {
    const postContentWithMentionReplacements = (postContent.replace(/@[a-zA-Z0-9_.-]+/g, mentionReplacementMatchFunc));
    onUpdatePost(postContentWithMentionReplacements);
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
        <MessageTextarea
          rows={10}
          placeholder="Create a post"
          handleSearch={handleSearch}
          mentionLists={mentionList}
          setMessageContent={setPostContent}
          formatMentionList={formatMention}
          setFormatMentionList={setFormatMention}
          defaultValue={decryptMessage(postContent)}
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

export default EditPostModal;
