import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Col, Form, InputGroup, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import ImagesContainer from '../ImagesContainer';
import UserCircleImage from '../UserCircleImage';
import PubWiseAd from '../PubWiseAd';
import { NEWS_PARTNER_DETAILS_DIV_ID } from '../../../utils/pubwise-ad-units';

const StyledCommentInputGroup = styled(InputGroup)`
  .form-control {
    border-radius: 1.875rem;
    border-bottom-right-radius: 0rem;
    border-top-right-radius: 0rem;
  }
  .input-group-text {
    background-color: var(--bs-dark);
    border-color: #3a3b46;
    border-radius: 1.875rem;
  }
  svg {
    min-width: 1.875rem;
  }
`;
function CommentInput({
  userData, inputRef, message, setIsReply, onChangeHandler, inputFile,
  handleFileChange, sendComment, imageArray, handleRemoveFile, dataId,
}: any) {
  return (
    <Form>
      <PubWiseAd className="text-center mb-3" id={NEWS_PARTNER_DETAILS_DIV_ID} autoSequencer />
      <Row className="ps-3 pt-2 order-last order-sm-0">
        <Col xs="auto" className="pe-0">
          <UserCircleImage src={userData.user.profilePic} className="me-3 bg-secondary" />
        </Col>
        <Col className="ps-0 pe-4">
          <div className="d-flex align-items-end mb-4">
            <StyledCommentInputGroup>
              <Form.Control
                id="comments"
                placeholder="Write a comment"
                className="fs-5 border-end-0"
                rows={1}
                as="textarea"
                ref={inputRef}
                value={message}
                onFocus={() => setIsReply && setIsReply(false)}
                onChange={(e) => onChangeHandler(e, dataId)}
              />
              <InputGroup.Text>
                <FontAwesomeIcon
                  role="button"
                  onClick={() => {
                    inputFile.current?.click();
                    setIsReply(false);
                  }}
                  icon={solid('camera')}
                  size="lg"
                />
                <input
                  type="file"
                  name="post"
                  className="d-none"
                  accept="image/*"
                  onChange={(post) => {
                    handleFileChange(post, dataId);
                  }}
                  multiple
                  ref={inputFile}
                />
              </InputGroup.Text>
            </StyledCommentInputGroup>
            <Button onClick={() => sendComment(dataId && dataId)} variant="link" className="ms-2 p-0">
              <FontAwesomeIcon icon={solid('paper-plane')} style={{ fontSize: '26px' }} className="text-primary" />
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mx-5 px-3">
        {imageArray.map((post: File) => (
          <Col xs="auto" key={post.name} className="px-3 mb-1">
            <ImagesContainer
              containerWidth="4.25rem"
              containerHeight="4.25rem"
              containerBorder="0.125rem solid #3A3B46"
              image={post}
              alt="Post comment image"
              handleRemoveImage={handleRemoveFile}
              containerClass="mt-2 mb-3 position-relative d-flex justify-content-center align-items-center rounded border-0"
              removeIconStyle={{
                padding: '0.313rem 0.438rem',
                top: '-0.5rem',
                left: '3.5rem',
              }}
            />
          </Col>
        ))}
      </Row>
    </Form>
  );
}

export default CommentInput;
