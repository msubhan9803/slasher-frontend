import React, { useState, ChangeEvent } from 'react';
import {
  Button,
  Col, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import ReCAPTCHA from 'react-google-recaptcha';

const StyledContainer = styled.div`
  background-color: #1B1B1B;

  & > form {
    max-width: 900px;
  }
  
  .recaptcha-element > div {
    margin: auto;
  }
`;

const FormControl = styled(Form.Control)`
::placeholder {
  color: white;
}
input {
  color: white;
}
`;
const RoundButton = styled(Button)`
  border-radius: 50rem;
  :hover {
    color: white;
    background: var(--bs-primary);
  }
`;
function PublicSignIn() {
  const [signUpData, setSignUpData] = useState({
    userName: '',
    email: '',
  });
  return (
    <StyledContainer>
      <Form className="text-center py-5 px-4 mt-4 mx-auto">
        <Row className="pt-3">
          <Col>
            <p className="text-primary mb-0 text-uppercase fs-4">We would love to hear from you!</p>
            <h1 className="fw-bolder">GET NOTIFIED OF ALL THE LATEST SLASHER NEWS &#8722; SIGN UP!</h1>
          </Col>
        </Row>
        <Row className="text-light justify-content-center mt-3 mb-5 pb-2">
          <Col>
            <p>
              Send a message to let us know if you have questions about Slasher, suggestions for
              new features, or would like to work with us.
            </p>
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mb-4">
            <Form.Group className="">
              <FormControl
                className="py-3"
                aria-label="Your name"
                type="text"
                placeholder="Your name"
                value={signUpData.userName}
                style={{ background: 'var(--bs-dark-rgb)' }}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSignUpData(
                  { ...signUpData, userName: e.target.value },
                )}
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-4">
            <Form.Group className="">
              <FormControl
                className="py-3"
                aria-label="Email address"
                type="text"
                placeholder="Email address"
                value={signUpData.email}
                style={{ background: 'var(--bs-dark-rgb)' }}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSignUpData(
                  { ...signUpData, email: e.target.value },
                )}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col className="d-flex recaptcha-element">
            <ReCAPTCHA
              sitekey="6LfJ9dcZAAAAAKaqEGRbBQMg66p-0Cgw4rf2M3J6"
            />
          </Col>
        </Row>
        <div className="mb-3">
          <RoundButton style={{ padding: '15px 56px 15px 56px' }}>SIGN UP</RoundButton>
        </div>
      </Form>
    </StyledContainer>
  );
}

export default PublicSignIn;
