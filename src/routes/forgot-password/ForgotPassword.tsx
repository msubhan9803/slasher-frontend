import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Col, Form, Row,
} from 'react-bootstrap';
import RoundButton from '../../components/ui/RoundButton';
import { forgotPassword } from '../../api/users';
import CustomInputGroup from '../../components/ui/CustomInputGroup';
import ErrorMessageList from '../../components/ui/ErrorMessageList';

interface Password {
  email: string;
}

function ForgotPassword() {
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<Password>({
    email: '',
  });

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const userInfo = { ...forgotPasswordEmail, [event.target.name]: event.target.value };
    setForgotPasswordEmail(userInfo);
  };

  const handleForgotPassword = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    forgotPassword(forgotPasswordEmail.email).then(() => {
      setErrorMessage([]);
      setPasswordResetSent(true);
    }).catch((error) => {
      setErrorMessage(error.response.data.message);
    });
  };

  return (
    <Row className="justify-content-center">
      <div className="col-lg-8 align-self-center text-center">
        <h1 className="h2">Forgot your password?</h1>
        <p>That’s ok - we’re here to help!</p>
        <p className="mt-4">
          Enter the email address associated with your Slasher account and
          we’ll send you a link to reset your password.
          {' '}
          <br />
          {' '}
          Be sure to check your spam
          folder if you don’t see the email within 15 minutes.
        </p>
        <Form className="row d-flex flex-column align-items-center mt-4">
          <Col sm={7} md={5} lg={8}>
            <CustomInputGroup
              size="lg"
              label="Email address"
              inputType="email"
              name="email"
              value={forgotPasswordEmail.email}
              onChangeValue={handlePasswordChange}
            />
            <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
            {
              passwordResetSent
                ? (
                  <Alert variant="info">
                    If a user with that email address exists,
                    a password reset email has been sent!
                  </Alert>
                )
                : (
                  <RoundButton type="submit" onClick={handleForgotPassword} className="mt-3 w-100" variant="primary">
                    Send
                  </RoundButton>
                )
            }
          </Col>
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
          If you never received an account verification email,
          &nbsp;
          <Link to="/app/verification-email-not-received" className="text-decoration-none text-primary">
            click here
          </Link>
          .
        </p>
      </div>
    </Row>
  );
}

export default ForgotPassword;
