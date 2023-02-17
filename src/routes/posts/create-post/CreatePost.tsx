/* eslint-disable max-lines */
import React, {
  ChangeEvent, useRef, useState,
} from 'react';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import RoundButton from '../../../components/ui/RoundButton';
import UserCircleImage from '../../../components/ui/UserCircleImage';
import { createPost } from '../../../api/feed-posts';
import { getSuggestUserName } from '../../../api/users';
import MessageTextarea from '../../../components/ui/MessageTextarea';
import { useAppSelector } from '../../../redux/hooks';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import ImagesContainer from '../../../components/ui/ImagesContainer';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';

export interface MentionProps {
  id: string;
  userName: string;
  profilePic: string;
}
export interface FormatMentionProps {
  id: string;
  value: string;
  format: string;
}
const AddPhotosButton = styled(RoundButton)`
  background-color: #1F1F1F !important;
`;

function CreatePost() {
  const inputFile = useRef<HTMLInputElement>(null);
  const [uploadPost, setUploadPost] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [imageArray, setImageArray] = useState<any>([]);
  const [mentionList, setMentionList] = useState<MentionProps[]>([]);
  const [postContent, setPostContent] = useState<string>('');
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
  const loggedInUser = useAppSelector((state) => state.user.user);
  const navigate = useNavigate();

  const handleFileChange = (postImage: ChangeEvent<HTMLInputElement>) => {
    if (!postImage.target) {
      return;
    }
    if (postImage.target.name === 'post' && postImage.target && postImage.target.files) {
      const uploadedPostList = [...uploadPost];
      const imageArrayList = [...imageArray];
      const fileList = postImage.target.files;
      for (let list = 0; list < fileList.length; list += 1) {
        if (uploadedPostList.length < 10) {
          const image = URL.createObjectURL(postImage.target.files[list]);
          uploadedPostList.push(image);
          imageArrayList.push(postImage.target.files[list]);
        }
      }
      setUploadPost(uploadedPostList);
      setImageArray(imageArrayList);
    }
  };

  const handleRemoveFile = (postImage: File) => {
    const removePostImage = imageArray.filter((image: File) => image !== postImage);
    setImageArray(removePostImage);
  };

  const handleSearch = (text: string) => {
    setMentionList([]);
    if (text) {
      getSuggestUserName(text)
        .then((res) => setMentionList(res.data));
    }
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

  const addPost = () => {
    /* eslint no-useless-escape: 0 */
    const postContentWithMentionReplacements = (postContent.replace(/\@[a-zA-Z0-9_.-]+/g, mentionReplacementMatchFunc));
    createPost(postContentWithMentionReplacements, imageArray)
      .then(() => {
        setErrorMessage([]);
        navigate(`/${Cookies.get('userName')}/posts`);
      })
      .catch((error) => {
        setErrorMessage(error.response.data.message);
      });
  };
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Row className="d-md-none bg-dark">
          <Col xs="auto" className="ms-2"><FontAwesomeIcon role="button" icon={solid('arrow-left')} size="lg" /></Col>
          <Col><h1 className="h2 text-center">Create Post</h1></Col>
        </Row>
        <Form className="bg-dark px-4 py-4 rounded-2">
          <Form.Group controlId="about-me">
            <div className="align-items-center d-flex form-label mb-4 w-100 mb-4">
              <UserCircleImage src={loggedInUser.profilePic} className="me-3" />
              <h2 className="h3 mb-0 align-self-center">
                {loggedInUser.userName}
              </h2>
            </div>
          </Form.Group>
          <div className="mt-3">
            <MessageTextarea
              rows={10}
              placeholder="Create a post"
              handleSearch={handleSearch}
              mentionLists={mentionList}
              setMessageContent={setPostContent}
              formatMentionList={formatMention}
              setFormatMentionList={setFormatMention}
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
          />
          <Row>
            <Col xs={12} className="order-1 order-md-0">
              <Row>
                {imageArray.map((post: File) => (
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
              <AddPhotosButton size="md" disabled={uploadPost.length >= 10} className="mt-4 border-0 btn btn-form w-100 rounded-5 py-2" onClick={() => inputFile.current?.click()}>
                <FontAwesomeIcon icon={regular('image')} className="me-2" />
                <span className="h3">Add photos</span>
              </AddPhotosButton>
            </Col>
            <Col md="auto" className="order-2 ms-auto">
              <RoundButton className="px-4 mt-4 w-100" size="md" onClick={addPost}>
                <span className="h3">Post</span>
              </RoundButton>
            </Col>
          </Row>
        </Form>
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}
export default CreatePost;
