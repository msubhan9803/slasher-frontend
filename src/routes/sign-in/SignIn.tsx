import React from 'react';
import styled from 'styled-components';
import {
  Button,
  Col, Container, Form, FormControl, Image, InputGroup, Row,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import signIn from '../../images/sign-in.svg';
import user from '../../images/user.svg';
import lock from '../../images/lock.svg';
import UnauthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';

const SignInContainer = styled(Container)`
img {
  width : 75%
}

span{
  background-color: rgb(31, 31, 31);
  border-color: #3A3B46;
  border-radius: 10px;
  border-start-end-radius: 0;
  border-end-end-radius: 0;
}

.form-control{
  background-color: #1F1F1F;
  border: 1px solid #3A3B46;
  border-radius: 10px;
}

a{
  text-decoration: none;
}

.text-justify {
  text-align: justify;
}
`;

function SignIn() {
  return (
    <UnauthenticatedSiteWrapper>
      <SignInContainer className="pb-4 pt-5">
        <Row className="align-items-center">
          <Col sm={12} md={7} lg={7}>
            <div className="login-img d-flex justify-content-center d-sm-block pt-2">
              <Image src={signIn} />
            </div>
          </Col>
          <Col sm={12} md={5} lg={5}>
            <Row className="mt-3 mt-sm-0">
              <div>
                <h3 className="text-center">Sign In</h3>
                <Form>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <InputGroup className="mb-2">
                      <span className="input-group-text border-end-0">
                        <Image src={user} />
                      </span>
                      <FormControl id="inlineFormInputGroup" placeholder="Username" className="text-white border-start-0 shadow-none" />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <InputGroup className="mb-2">
                      <span className="input-group-text">
                        <Image src={lock} />
                      </span>
                      <Form.Control type="password" placeholder="Password" className="text-white border-start-0 shadow-none" />
                    </InputGroup>
                  </Form.Group>

                  <p className="text-center">
                    Forgot your password? &nbsp;
                    <Link to="/sign-in" className="text-primary">
                      Click here
                    </Link>
                  </p>

                  <Button className="w-100" variant="primary" type="submit">
                    Sign in
                  </Button>

                  <p className="text-center mt-3">
                    Don’t have an account? &nbsp;
                    <Link to="/sign-in" className="text-primary">
                      Click here
                    </Link>
                  </p>

                  <p className="fs-6 text-justify">
                    NOTE: If you just created an account and you are not able to login,
                    be sure you activated your account by clicking
                    the button in the email we sent when you created your account.

                    <i>
                      Your account will not be activated until you click the button in that email.
                    </i>
                    <br />
                    <br />
                    Please check your spam folder for the email.
                    If you have not received it, please &nbsp;
                    <Link to="/sign-in" className="text-primary">click here.</Link>
                  </p>

                </Form>
              </div>
            </Row>
          </Col>
        </Row>
      </SignInContainer>
    </UnauthenticatedSiteWrapper>

  );
}

export default SignIn;
