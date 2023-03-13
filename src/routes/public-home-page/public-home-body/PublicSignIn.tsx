import React, { useState, ChangeEvent } from 'react';
import {
  Col, Container, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import ReCAPTCHA from 'react-google-recaptcha';
import RoundButton from '../../../components/ui/RoundButton';

const StyledContainer = styled.div`
  background-color: #1B1B1B;
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
          <Row>
            <Col>
              <h1>GET NOTIFIED OF ALL THE LATEST SLASHER NEWS - SIGN UP!</h1>
            </Col>
          </Row>
          <Row className="justify-content-center my-4">
            <Col xs={10} md={5} lg={10} xl={5}>
              <p>
                Slasher will be launching lots of new features WORLDWIDE!
                Get all the lastest info, sneak previews, early beta access and more.
                Sign up now!
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-4">
              <Form.Group className="">
                <Form.Control
                  aria-label="Your Name"
                  type="text"
                  placeholder="Your Name"
                  value={signUpData.userName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSignUpData(
                    { ...signUpData, userName: e.target.value },
                  )}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-4">
              <Form.Group className="">
                <Form.Control
                  aria-label="Email address"
                  type="text"
                  placeholder="Email address"
                  value={signUpData.email}
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
            <RoundButton className="px-5">Sign up</RoundButton>
          </div>
        </Form>
      </Container>
    </StyledContainer>
  );
}

export default PublicSignIn;
