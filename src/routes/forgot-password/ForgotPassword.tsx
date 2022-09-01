import React from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Form,
  Row,
} from 'react-bootstrap';
import UnauthenticatedPageWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedPageWrapper';

function ForgotPassword() {
  return (
    <UnauthenticatedPageWrapper>
      <Row className="justify-content-center">
        <div className="col-lg-8 align-self-center text-center">
          <h2>Forgot your password?</h2>
          <p>That’s ok - we’re here to help!</p>
          <p className="mt-4">
            Enter the email address associated with your Slasher account below and
            we’ll send you a link to reset your password. Be sure to check your spam
            folder if you don’t see the email within 15 minutes.
          </p>
          <p>
            <span className="text-primary">
              NOTE:
            </span>
            &nbsp;
            If you just created an account and you are not able to login, be sure you activated
            your account by clicking the button in the email we sent when you created your
            account. Your account will not be activated until you click the button in that email.
          </p>
          <p>
            Please check your spam folder for the email. If you have not received it,
            please
            &nbsp;
            <Link to="/" className="text-decoration-none text-primary">
              click here
            </Link>
            .
          </p>
          <Form className="row d-flex flex-column align-items-center mt-4">
            <div className="col-10 col-sm-8 col-lg-6">
              <Form.Control className="text-white shadow-none" type="email" placeholder="Email address" />
              <Button variant="link" size="lg" className="mt-4 w-100">Send</Button>
            </div>
          </Form>

          <p className="mt-4">
            If you haven’t gotten an email, please send an email to&nbsp;
            <Link to="/" className="text-decoration-none text-primary">
              <span>
                help@slasher.tv
              </span>
            </Link>
            &nbsp;and let us know.
            <br />
            Be sure to include your username in the email too.
          </p>
        </div>
      </Row>
    </UnauthenticatedPageWrapper>
  );
}

export default ForgotPassword;
