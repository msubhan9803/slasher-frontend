import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import {
  Col, Form, InputGroup, Row,
} from 'react-bootstrap';
import styled from 'styled-components';

const UserProfileImage = styled.img`
  height: 3.125rem;
  width: 3.125rem;
`;
const StyledCommentInputGroup = styled(InputGroup)`
  .form-control {
    border-radius: 1.875rem;
    border-bottom-right-radius: 0rem;
    border-top-right-radius: 0rem;
  }
  .input-group-text {
    background-color: rgb(31, 31, 31);
    border-color: #3a3b46;
    border-radius: 1.875rem;
  }
  svg {
    min-width: 1.875rem;
  }
`;
function CommentInput() {
  return (
    <Row className="pt-2 order-last order-sm-0">
      <Col xs="auto" className="pe-0">
        <UserProfileImage src="https://i.pravatar.cc/300?img=56" className="me-3 rounded-circle bg-secondary" />
      </Col>
      <Col className="ps-0 pe-4">
        <StyledCommentInputGroup className="mb-4">
          <Form.Control
            placeholder="Write a comment"
            className="border-end-0 fs-5"
          />
          <InputGroup.Text>
            <FontAwesomeIcon role="button" icon={solid('camera')} size="lg" className="" />
          </InputGroup.Text>
        </StyledCommentInputGroup>
      </Col>
    </Row>
  );
}

export default CommentInput;
