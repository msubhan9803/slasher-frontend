import React from 'react';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import userProfileIconPlaceholder from '../../../placeholder-images/placeholder-user.jpg';

const UserCircleImage = styled.img`
  border-radius: 50%;
  height:50px;
  width:50px;
  border: 1px solid #fff;
`;

function CreatePost() {
  return (
    <AuthenticatedPageWrapper>
      <Row>
        <h4>Create Post</h4>
      </Row>
      <Row>
        <Row className="d-flex">
          <Col xs={2}><UserCircleImage className="ms-3" src={userProfileIconPlaceholder} alt="User icon" /></Col>
          <Col xs={3}><h4>Aly Khan</h4></Col>
        </Row>
        <Row />
        <Row />
      </Row>
    </AuthenticatedPageWrapper>
  );
}

export default CreatePost;
