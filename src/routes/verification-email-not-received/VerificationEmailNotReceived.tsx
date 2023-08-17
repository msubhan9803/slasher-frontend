import React, { useState } from 'react';
import {
  Alert, Col, Form, Row,
} from 'react-bootstrap';
import useProgressButton from '../../components/ui/ProgressButton';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import { verificationEmailNotReceived } from '../../api/users';
import RoundButtonLink from '../../components/ui/RoundButtonLink';

function VerificationEmailNotReceived() {
  const [email, setEmail] = useState<string>('');
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setProgressButtonStatus('loading');
    verificationEmailNotReceived(
      email,
    ).then(() => {
      setProgressButtonStatus('default');
      setSuccessMessage(
        `If a user with email address ${email} has registered for Slasher and the account has not been activated, a verification email will be re-sent.`,
      );
    }).catch((requestError: any) => {
      setProgressButtonStatus('failure');
      setErrorMessages(requestError.response.data.message);
    });
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="text-center">
        <h1 className="mb-3">Verification Email Not Received</h1>
        <Row className="justify-content-center">
          <Col sm={8}>
            <p className="mt-4">
              If you created a Slasher account and never received the
              verification email to activate your account, please
              enter your email address below and we will send another activation
              email to you. Please allow up to 30 minutes to receive a new email
              and be sure to check your spam folder if you do not see it within 30 minutes.
            </p>

            <Form className="my-5">
              <Row className="flex-column align-items-center">
                <Col xs={10} md={8} lg={6}>
                  {
                    successMessage
                      ? (
                        <div>
                          <Alert variant="info" className="mb-0">{successMessage}</Alert>
                          <RoundButtonLink to="/app/sign-in" className="mt-4 px-5" variant="primary">
                            Go to sign in
                          </RoundButtonLink>
                        </div>
                      )
                      : (
                        <>
                          <Form.Control
                            aria-label="Email"
                            className="mb-3"
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            readOnly={!!successMessage}
                          />
                          <ErrorMessageList errorMessages={errorMessages} divClass="mt-2" className="m-0" />
                          <ProgressButton label="Send" onClick={handleSubmit} className="mt-2 w-100" />
                        </>
                      )
                  }
                </Col>
              </Row>
            </Form>

            <p>
              If you have already done this and never received the email,
              please let us know by emailing us at&nbsp;
              <a href="mailto:help@slasher.tv" className="text-decoration-none text-primary">
                help@slasher.tv
              </a>
              &nbsp;from the email address you used when you created your
              account and include your Slasher username as well. We will
              be happy to help you!
            </p>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default VerificationEmailNotReceived;
