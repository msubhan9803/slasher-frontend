import React, { useState } from 'react';
import {
  Button, Col, Container, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';

const SkipButton = styled(Button)`
  background-color: #383838;
  border: 0.063rem solid #1f1f1f;
`;

function OnboardingAboutMe() {
  const [message, setMessage] = useState('');
  return (
    <Container>
      <h1 className="h4 mt-3 text-center text-md-start">About Me</h1>
      <p className="pb-0 my-0 fw-bold text-center text-md-start">Tell people a little about yourself! </p>
      <p className="pt-0 text-center text-md-start">Here are some ideas: your favorite horror movies, favorite book, music you like, if you make horror-related stuff.</p>
      <Row>
        <Col>
          <Form.Control
            rows={10}
            as="textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write here..."
          />
        </Col>
      </Row>
      <Row className="d-flex justify-content-center text-center h-auto mt-5">
        <Col>
          <SkipButton as="input" type="button" value="Skip" className="mx-1 rounded-pill text-white px-5 py-2" />
          <Button as="input" type="button" value="Next step" className="mx-1 rounded-pill px-4 py-2" />
        </Col>
      </Row>
    </Container>
  );
}

export default OnboardingAboutMe;
