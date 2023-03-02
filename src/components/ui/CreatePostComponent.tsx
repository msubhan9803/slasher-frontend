/* eslint-disable max-lines */
import React, { ChangeEvent, useRef, useState } from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Row, Col, Form, Button,
} from 'react-bootstrap';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { getSuggestUserName } from '../../api/users';
import ErrorMessageList from './ErrorMessageList';
import ImagesContainer from './ImagesContainer';
import MessageTextarea from './MessageTextarea';
import RoundButton from './RoundButton';
import CharactersCounter from './CharactersCounter';
import RatingButtonGroups from './RatingButtonGroups';
import CustomWortItText from './CustomWortItText';
import { StyledBorder } from './StyledBorder';

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
  errorMessage?: string[] | undefined;
  createUpdatePost?: () => void;
  setPostMessageContent: (val: string) => void;
  imageArray?: any;
  setImageArray?: any;
  defaultValue?: string;
  formatMention: FormatMentionProps[];
  setFormatMention: (val: any) => void;
  deleteImageIds?: any;
  setDeleteImageIds?: any;
  postType?: string;
  titleContent?: string;
  setTitleContent?: (value: string) => void;
  containSpoiler?: boolean;
  setContainSpoiler?: (value: boolean) => void;
  rating?: number;
  setRating?: (value: number) => void;
  goreFactor?: number;
  setGoreFactor?: (value: number) => void;
  liked?: boolean;
  selectedPostType?: string;
  setSelectedPostType?: (value: string) => void;
}

const AddPhotosButton = styled(RoundButton)`
  background-color: #1F1F1F !important;
`;
const groupPostType: string[] = [
  'Review', 'Discussion', 'Help', 'Recommended', 'Opinions wanted', 'Hidden gem',
  'News', 'Event', 'Cosplay', 'My work', 'Collaboration', 'For sale', 'Want to buy',
];
const PostTypeButton = styled(Button)`
  border : 0.125rem solid #383838
`;

function CreatePostComponent({
  errorMessage, createUpdatePost, setPostMessageContent, imageArray, setImageArray,
  defaultValue, formatMention, setFormatMention, deleteImageIds, setDeleteImageIds,
  postType, titleContent, setTitleContent, containSpoiler, setContainSpoiler,
  rating, setRating, goreFactor, setGoreFactor, liked, selectedPostType,
  setSelectedPostType,
}: Props) {
  const inputFile = useRef<HTMLInputElement>(null);
  const [mentionList, setMentionList] = useState<MentionProps[]>([]);
  const [uploadPost, setUploadPost] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const paramsType = searchParams.get('type');

  const handleRemoveFile = (postImage: any) => {
    const removePostImage = imageArray.filter((image: File) => image !== postImage);
    setDeleteImageIds([...deleteImageIds, postImage._id]);
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
    <div className={postType === 'review' ? 'bg-dark mb-3 px-4 py-4 rounded-2' : ''}>

      {postType === 'review' && (
        <>
          <div className="d-block d-md-flex d-lg-block d-xl-flex align-items-center mb-4">
            <div>
              <RatingButtonGroups
                rating={rating}
                setRating={setRating}
                label="Your rating"
                size="1x"
              />
            </div>
            <div className="mx-md-3 mx-lg-0 mx-xl-3 my-3 my-md-0 my-lg-3 my-xl-0">
              <RatingButtonGroups
                rating={goreFactor}
                setRating={setGoreFactor}
                label="Your gore factor rating"
                size="1x"
                isGoreFator
              />
            </div>
            <div>
              <Form.Label className="fw-bold h3">Worth watching?</Form.Label>
              <div className="d-flex align-items-center">
                {/* // un-comment below codewhen api integrated */}
                {/* <WorthWatchIcon /> */}
                <CustomWortItText
                  divClass="align-items-center py-2 px-3 bg-black rounded-pill"
                  textClass="fs-4"
                  customCircleWidth="20px"
                  customCircleHeight="20px"
                  customIconWidth="10.67px"
                  customIconHeight="10.67px"
                  worthIt={liked || false}
                />
              </div>
            </div>
          </div>
          <h1 className="h3 mb-3">Write your review</h1>
        </>
      )}
      {(postType === 'review' || paramsType === 'group-post') && (
        <div className="position-relative">
          <Form.Control
            maxLength={150}
            type="text"
            value={titleContent}
            onChange={(e) => {
              setTitleContent!(e.target.value);
            }}
            placeholder={postType === 'review' ? 'Write a headline' : 'Title'}
            className="bg-black"
            aria-label="Title"
            style={{ paddingRight: '150px' }}
          />
          <CharactersCounter
            counterClass="float-end fs-4 position-absolute"
            charCount={titleContent!.length}
            totalChar={150}
            right="10px"
          />
        </div>
      )}
      <div className={`mt-3 ${(postType === 'review' || paramsType === 'group-post') ? 'form-control p-0 bg-black' : ''}`}>
        <MessageTextarea
          rows={10}
          placeholder={postType === 'review' ? 'Write your review here' : 'Create a post'}
          handleSearch={handleSearch}
          mentionLists={mentionList}
          setMessageContent={setPostMessageContent}
          formatMentionList={formatMention}
          setFormatMentionList={setFormatMention}
          defaultValue={defaultValue}
        />
      </div>
      {paramsType === 'group-post' && (
        <>
          <div className="my-4">
            <h2 className="h3 fw-bold">
              Post type&nbsp;
              <span className="text-light fw-normal">
                (Optional)
              </span>
            </h2>
            {groupPostType.map((type: string) => (
              <PostTypeButton
                key={`${type}-1`}
                as="input"
                type="button"
                value={type}
                className={`${type === selectedPostType ? 'bg-primary text-black' : 'bg-secondary text-white'} rounded-pill py-2 px-3 m-1`}
                onClick={() => setSelectedPostType!(type)}
              />
            ))}
          </div>
          <StyledBorder />
        </>
      )}
      {(postType === 'review' || paramsType === 'group-post') && (
        <>
          <div className={paramsType === 'group-post' ? 'my-4' : 'mt-4'}>
            <h2 className="h3 fw-bold">Contains spoilers</h2>
            <label htmlFor="spoiler" className="d-flex text-light">
              <input
                id="spoiler"
                type="checkbox"
                checked={containSpoiler}
                onChange={() => setContainSpoiler!(!containSpoiler)}
                className="me-2"
              />
              Check this box if this post contains any spoilers.
            </label>
          </div>
          {paramsType === 'group-post' && <StyledBorder />}
        </>
      )}
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
        {postType !== 'review'
          && (
            <>
              <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
              <Col md="auto" className="mb-3 mb-md-0 order-0 order-md-1 me-auto">
                <AddPhotosButton size="md" disabled={uploadPost && uploadPost.length >= 10} className="mt-4 border-0 btn btn-form w-100 rounded-5 py-2" onClick={() => inputFile.current?.click()}>
                  <FontAwesomeIcon icon={regular('image')} className="me-2" />
                  <span className="h3">Add photos</span>
                </AddPhotosButton>
              </Col>
            </>
          )}
        <Col md="auto" className={postType === 'review' ? '' : 'order-2 ms-auto'}>
          <RoundButton className="px-4 mt-4 w-100" size="md" onClick={createUpdatePost}>
            <span className="h3">{postType === 'review' ? 'Submit' : 'Post'}</span>
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
  createUpdatePost: undefined,
  imageArray: null,
  setImageArray: undefined,
  errorMessage: undefined,
  postType: '',
  titleContent: '',
  setTitleContent: undefined,
  containSpoiler: false,
  setContainSpoiler: undefined,
  rating: 0,
  setRating: undefined,
  goreFactor: 0,
  setGoreFactor: undefined,
  liked: false,
  selectedPostType: '',
  setSelectedPostType: undefined,
};
export default CreatePostComponent;
