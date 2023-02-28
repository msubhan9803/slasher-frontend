import React, { ChangeEvent, useRef, useState } from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Row, Col } from 'react-bootstrap';
import styled from 'styled-components';
import { getSuggestUserName } from '../../api/users';
import ErrorMessageList from './ErrorMessageList';
import ImagesContainer from './ImagesContainer';
import MessageTextarea from './MessageTextarea';
import RoundButton from './RoundButton';

interface MentionProps {
  id: string;
  userName: string;
  profilePic: string;
}
interface FormatMentionProps {
  id: string;
  value: string;
  format: string;
}
interface Props {
  errorMessage: string[] | undefined;
  createUpdatePost: () => void;
  setPostMessageContent: (val: string) => void;
  imageArray: any;
  setImageArray: any;
  defaultValue?: string;
  formatMention: FormatMentionProps[];
  setFormatMention: (val: any) => void;
  deleteImageIds?: any;
  setDeleteImageIds?: any;
}

const AddPhotosButton = styled(RoundButton)`
  background-color: #1F1F1F !important;
`;

function CreatePostComponent({
  errorMessage,
  createUpdatePost,
  setPostMessageContent,
  imageArray,
  setImageArray,
  defaultValue,
  formatMention,
  setFormatMention,
  deleteImageIds,
  setDeleteImageIds,
}: Props) {
  const inputFile = useRef<HTMLInputElement>(null);
  const [mentionList, setMentionList] = useState<MentionProps[]>([]);
  const [uploadPost, setUploadPost] = useState<string[]>([]);

  const handleRemoveFile = (postImage: any) => {
    const removePostImage = imageArray.filter((image: File) => image !== postImage);
    setDeleteImageIds([...deleteImageIds, postImage._id].filter(Boolean));
    setImageArray(removePostImage);
  };

  const handleFileChange = (postImage: ChangeEvent<HTMLInputElement>) => {
    if (!postImage.target) {
      return;
    }
    if (postImage.target.name === 'post' && postImage.target && postImage.target.files) {
      const uploadedPostList = [...uploadPost] as any;
      const imageArrayList = [...imageArray];
      const fileList = postImage.target.files;
      for (let list = 0; list < fileList.length; list += 1) {
        if (uploadedPostList.length < 10) {
          const image = postImage.target.files[list];
          uploadedPostList.push(image);
          imageArrayList.push(postImage.target.files[list]);
        }
      }
      setUploadPost(uploadedPostList);
      setImageArray(imageArrayList);
    }
  };

  const handleSearch = (text: string) => {
    setMentionList([]);
    if (text) {
      getSuggestUserName(text)
        .then((res) => setMentionList(res.data));
    }
  };

  return (
    <div>
      <div className="mt-3">
        <MessageTextarea
          rows={10}
          placeholder="Create a post"
          handleSearch={handleSearch}
          mentionLists={mentionList}
          setMessageContent={setPostMessageContent}
          formatMentionList={formatMention}
          setFormatMentionList={setFormatMention}
          defaultValue={defaultValue}
        />
      </div>
      <input
        type="file"
        name="post"
        className="d-none"
        accept="image/*"
        onChange={(post) => {
          handleFileChange(post);
        }}
        multiple
        ref={inputFile}
        aria-label="image"
      />
      <Row>
        <Col xs={12} className="order-1 order-md-0">
          <Row>
            {imageArray && imageArray.map((post: File) => (
              <Col xs="auto" key={post.name} className="mb-1">
                <ImagesContainer
                  containerWidth="7.25rem"
                  containerHeight="7.25rem"
                  containerBorder="0.125rem solid #3A3B46"
                  image={post}
                  alt="post image"
                  handleRemoveImage={handleRemoveFile}
                  containerClass="mt-4 position-relative d-flex justify-content-center align-items-center rounded border-0"
                  removeIconStyle={{
                    padding: '0.313rem 0.438rem',
                    top: '6.313rem',
                    left: '6.313rem',
                  }}
                />
              </Col>
            ))}
          </Row>
        </Col>
        <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
        <Col md="auto" className="mb-3 mb-md-0 order-0 order-md-1 me-auto">
          <AddPhotosButton size="md" disabled={uploadPost && uploadPost.length >= 10} className="mt-4 border-0 btn btn-form w-100 rounded-5 py-2" onClick={() => inputFile.current?.click()}>
            <FontAwesomeIcon icon={regular('image')} className="me-2" />
            <span className="h3">Add photos</span>
          </AddPhotosButton>
        </Col>
        <Col md="auto" className="order-2 ms-auto">
          <RoundButton className="px-4 mt-4 w-100" size="md" onClick={createUpdatePost}>
            <span className="h3">Post</span>
          </RoundButton>
        </Col>
      </Row>
    </div>
  );
}
CreatePostComponent.defaultProps = {
  defaultValue: '',
  deleteImageIds: [],
  setDeleteImageIds: () => { },
};
export default CreatePostComponent;
