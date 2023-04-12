import React, { useState, ChangeEvent } from 'react';
import {
  Button,
  Col, Container, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import ReCAPTCHA from 'react-google-recaptcha';

const StyledContainer = styled.div`
  background-color: #1B1B1B;
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
      <Container>
        <Form className="text-center py-5 px-4 mt-4">
          <Row className="pt-3">
            <Col>
              <h1 className="fw-bolder">GET NOTIFIED OF ALL THE LATEST SLASHER NEWS &#8722; SIGN UP!</h1>
            </Col>
          </Row>
          <Row className="text-light justify-content-center mt-3 mb-5 pb-2">
            <Col>
              <p>
                Slasher will be launching lots of new features WORLDWIDE!
                <br />
                Get all the lastest info, sneak previews, early beta access and more.
                <br />
                Sign up now!
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
          <Row className="mb-3 justify-content-center">
            <Col xs={9} sm={8} md={5} lg={4} xxl={3} className="ps-xl-4">
              <ReCAPTCHA
                sitekey="6LfJ9dcZAAAAAKaqEGRbBQMg66p-0Cgw4rf2M3J6"
              />
            </Col>
          </Row>
          <div className="mb-3">
            <RoundButton style={{ padding: '15px 56px 15px 56px' }}>SIGN UP</RoundButton>
          </div>
        </Form>
      </Container>
    </StyledContainer>
  );
}

export default PublicSignIn;
