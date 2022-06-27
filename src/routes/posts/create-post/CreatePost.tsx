import React, {
  ChangeEvent, useRef, useState,
} from 'react';
import {
  Button, Col, Form, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';

interface AddImage {
  image: string;
}

const UserCircleImage = styled(Image)`
  height: 3.125rem;
  width: 3.125rem;
`;

const ImageContainer = styled.div`
  width: 6.25rem;
  height: 6.25rem;
  background-color: #1F1F1F;
  border: 0.125rem solid #3A3B46
`;

function CreatePost() {
  const inputFile = useRef<HTMLInputElement>(null);
  const [posts, setPosts] = useState('');
  const [postUpload, setImageUpload] = useState<AddImage[]>([]);

  const handleFileChange = (postImage: ChangeEvent<HTMLInputElement>) => {
    if (!postImage.target) {
      return;
    }
    if (postImage.target.name === 'post' && postImage.target && postImage.target.files && postImage.target.files.length) {
      const postList = [...postUpload];
      const fileList = postImage.target.files;
      for (let i = 0; i < fileList.length; i += 1) {
        if (postList.length < 10) {
          const image = URL.createObjectURL(postImage.target.files[i]);
          const newPostList = { image };
          postList.push(newPostList);
        }
      }
      setImageUpload(postList);
    }
  };

  const handleRemoveFile = (img: string) => {
    const removePostImage = postUpload.filter((i) => i.image !== img);
    setImageUpload(removePostImage);
  };

  return (
    <AuthenticatedPageWrapper>
      <h1 className="h3">Create Post</h1>
      <Form className="bg-dark px-3 py-4 rounded-2">
        <Form.Group className="mb-4" controlId="about-me">
          <Form.Label className="align-items-center d-flex form-label mb-4 px-2 w-100 mb-4">
            <UserCircleImage src="https://i.pravatar.cc/300?img=12" className="rounded-circle me-3" />
            <h2 className="rounded-circle h5 mb-0">
              Aly Khan
            </h2>
          </Form.Label>
          <Form.Control
            rows={8}
            as="textarea"
            value={posts}
            onChange={(postImage) => setPosts(postImage.target.value)}
            placeholder="Write something....."
          />
        </Form.Group>
        {postUpload.length > 0 && (
          <Row className="mb-4 d-none d-md-flex">
            {postUpload.map((post: AddImage) => (
              <Col sm={4} lg={2} key={post.image} className="mb-3">
                <ImageContainer className="position-relative d-flex justify-content-center align-items-center rounded border-0">
                  <Image
                    src={post.image}
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
                      top: '5.313rem',
                      left: '5.313rem',
                    }}
                    onClick={() => handleRemoveFile(post.image)}
                  />
                </ImageContainer>
              </Col>
            ))}
          </Row>
        )}
        <Row className="justify-content-between">
          <Col md={4} lg={3} className="mb-3 mb-md-0">
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
            <Button disabled={postUpload.length >= 10} className="btn btn-form bg-dark w-100 rounded-5" onClick={() => inputFile.current?.click()}>
              <FontAwesomeIcon icon={regular('image')} className="me-2" />
              Add photos
            </Button>
          </Col>
          <Col xs={12} className="d-md-none">
            <Row>
              {postUpload.map((post: any) => (
                <Col xs={4} key={post.image} className="mb-3">
                  <ImageContainer className="position-relative d-flex justify-content-center align-items-center rounded border-0">
                    <Image
                      src={post.image}
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
                        top: '5.313rem',
                        left: '5.313rem',
                      }}
                      onClick={() => handleRemoveFile(post.image)}
                    />
                  </ImageContainer>
                </Col>
              ))}
            </Row>
          </Col>
          <Col md={3} lg={2}>
            <RoundButton className="w-100" type="submit">
              Post
            </RoundButton>
          </Col>
        </Row>
      </Form>
    </AuthenticatedPageWrapper>
  );
}

export default CreatePost;
