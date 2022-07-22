import React, {
  ChangeEvent, useRef, useState,
} from 'react';
import {
  Col, Form, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';

const UserCircleImage = styled(Image)`
  height:5rem;
  width: 5rem;
`;

const ImageContainer = styled.div`
  width:7.25rem;
  height:7.25rem;
  border: 0.125rem solid #3A3B46
`;

function CreatePost() {
  const inputFile = useRef<HTMLInputElement>(null);
  const [postContent, setPostContent] = useState('');
  const [uploadPost, setUploadPost] = useState<string[]>([]);

  const handleFileChange = (postImage: ChangeEvent<HTMLInputElement>) => {
    if (!postImage.target) {
      return;
    }
    if (postImage.target.name === 'post' && postImage.target && postImage.target.files) {
      const uploadedPostList = [...uploadPost];
      const fileList = postImage.target.files;
      for (let list = 0; list < fileList.length; list += 1) {
        if (uploadedPostList.length < 10) {
          const image = URL.createObjectURL(postImage.target.files[list]);
          uploadedPostList.push(image);
        }
      }
      setUploadPost(uploadedPostList);
    }
  };

  const handleRemoveFile = (postImage: string) => {
    const removePostImage = uploadPost.filter((image) => image !== postImage, postContent);
    setUploadPost(removePostImage);
  };

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <Row className="d-md-none bg-dark">
        <Col xs="auto" className="ms-2"><FontAwesomeIcon role="button" icon={solid('arrow-left-long')} size="2x" /></Col>
        <Col><h1 className="h4 text-center">Create Post</h1></Col>
      </Row>
      <p className="fs-4 fw-bold text-center text-md-start d-none d-md-block">Create Post</p>
      <Form className="bg-dark px-4 py-4 rounded-2">
        <Form.Group className=" mx-2 " controlId="about-me">
          <div className="align-items-center d-flex form-label mb-4  w-100 mb-4">
            <UserCircleImage src="https://i.pravatar.cc/300?img=12" className="rounded-circle me-3" />
            <p className="fs-4 fw-bold mb-0 align-self-center">
              Aly Khan
            </p>
          </div>
          <Form.Control
            rows={12}
            as="textarea"
            value={postContent}
            onChange={(contentEvent) => setPostContent(contentEvent.target.value)}
            placeholder="Create a post"
            style={{ resize: 'none' }}
            className="border-0 mb-0 pb-0"
          />
        </Form.Group>
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
              {uploadPost.map((post: string) => (
                <Col xs="auto" key={post} className="mb-1">
                  <ImageContainer className=" ms-2 mt-4 position-relative d-flex justify-content-center align-items-center rounded border-0">
                    <Image
                      src={post}
                      alt="Dating profile photograph"
                      className="w-100 h-100 img-fluid rounded"
                    />
                    <FontAwesomeIcon
                      icon={solid('times')}
                      size="xs"
                      role="button"
                      className="position-absolute bg-white text-primary rounded-circle"
                      style={{
                        padding: '0.313rem 0.438rem',
                        top: '6.313rem',
                        left: '6.313rem',
                      }}
                      onClick={() => handleRemoveFile(post)}
                    />
                  </ImageContainer>
                </Col>
              ))}
            </Row>
          </Col>
          <Col md={3} className="mb-3 mb-md-0 order-0 order-md-1 me-auto">
            <RoundButton disabled={uploadPost.length >= 10} style={{ backgroundColor: '#1F1F1F' }} className="mt-4 border-0 mx-2 btn btn-form w-100 rounded-5 py-2" onClick={() => inputFile.current?.click()}>
              <FontAwesomeIcon icon={regular('image')} className="me-2" />
              Add photos
            </RoundButton>
          </Col>
          <Col md={3} className="order-2 ms-auto me-2">
            <RoundButton className="me-2 mt-4 w-100" type="submit">
              Post
            </RoundButton>
          </Col>
        </Row>
      </Form>
    </AuthenticatedPageWrapper>
  );
}
export default CreatePost;
