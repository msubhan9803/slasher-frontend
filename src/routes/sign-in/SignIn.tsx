import React from 'react';
import {
  Button,
  Col, Container, Form, Image, Row,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import signIn from '../../images/sign-in.svg';
import UnauthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';
import CustomInputGroup from '../../components/ui/CustomInputGroup';

function SignIn() {
  return (
    <UnauthenticatedSiteWrapper>
      <Container className="py-4">
        <Row className="align-items-center">
          <Col sm={12} md={7} lg={7}>
            <div className="login-img text-center pb-4">
              <Image src={signIn} className="w-75" />
            </div>
          </Col>
          <Col sm={12} md={5} lg={5}>
            <Row className="mt-3 mt-sm-0">
              <div>
                <h1 className="h2 text-center mb-4">Sign In</h1>
                <Form>
                  <CustomInputGroup addonContent={<FontAwesomeIcon icon={solid('user')} size="lg" />} label="Username or email" />
                  <CustomInputGroup addonContent={<FontAwesomeIcon icon={solid('lock')} size="lg" />} label="Password" inputType="password" />

                  <p className="text-center">
                    <small>
                      Forgot your password? &nbsp;
                      <Link to="/sign-in" className="text-primary">
                        Click here
                      </Link>
                    </small>
                  </p>

                  <Button className="w-100 my-3" variant="primary" size="lg" type="submit">
                    Sign in
                  </Button>

                  <p className="text-center mt-3">
                    <small>
                      Don’t have an account? &nbsp;
                      <Link to="/sign-in" className="text-primary">
                        Click here
                      </Link>
                    </small>
                  </p>

                  <p className="fs-6">
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
      </Container>
    </UnauthenticatedSiteWrapper>
  );
}

export default SignIn;
