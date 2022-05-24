import React from 'react';
import {
  Button,
  Col, Container, Form, FormControl, Image, InputGroup, Row,
} from 'react-bootstrap';
import UnauthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';

function SignIn() {
  return (

    <Container>
      <UnauthenticatedSiteWrapper>
        <Row className="align-items-center">
          <Col sm={12} md={8} lg={8}>
            <div className="login-img">
              <Image style={{ width: '80%' }} src="/media/image/sign-in.svg" />
            </div>
          </Col>
          <Col sm={12} md={4} lg={4}>
            <Row>
              <h3 className="text-center">Sign In</h3>
              <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <InputGroup className="mb-2">
                    <span className="input-group-text" style={{ backgroundColor: '#1F1F1F', borderColor: '#3A3B46' }}>
                      <Image src="/media/image/user.svg" />
                    </span>
                    <FormControl id="inlineFormInputGroup" placeholder="Username" style={{ backgroundColor: '#1F1F1F', border: '1px solid #3A3B46' }} className="text-white border-start-0 shadow-none" />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <InputGroup className="mb-2">
                    <span className="input-group-text" style={{ backgroundColor: '#1F1F1F', borderColor: '#3A3B46' }}>
                      <Image src="/media/image/lock.svg" />
                    </span>
                    <Form.Control type="password" placeholder="Password" style={{ backgroundColor: '#1F1F1F', border: '1px solid #3A3B46' }} className="text-white border-start-0 shadow-none" />
                  </InputGroup>
                </Form.Group>

                <p className="text-center">
                  Forgot your password?
                  <a href="#" className="text-primary">
                    Click here
                  </a>
                </p>

                <Button className="w-100" variant="primary" type="submit">
                  Sign in
                </Button>

                <p className="text-center mt-3">
                  Don’t have an account?
                  <a href="#" className="text-primary">
                    Click here
                  </a>
                </p>

                <p className="text-justify">
                  NOTE: If you just created an account and you are not able to login,
                  be sure you activated your account by clicking the button in the email we sent when you created your account.

                  Your account will not be activated until you click the button in that email.
                  <br />
                  Please check your spam folder for the email. If you have not received it, please
                  <a href="#" className="text-primary">click here.</a>
                </p>

              </Form>
            </Row>
          </Col>
        </Row>
      </UnauthenticatedSiteWrapper>
    </Container>

  );
}

export default SignIn;
