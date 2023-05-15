import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppSelector } from '../../../redux/hooks';
import RoundButton from '../../../components/ui/RoundButton';

function RegistrationFinal() {
  const emailAddress = useAppSelector((state) => state.registration.email);
  return (
    <div className="text-center">
      <FontAwesomeIcon icon={regular('paper-plane')} size="6x" className="text-primary" />
      <h1 className="h2 mt-4">You’re almost there!</h1>
      <h2 className="h3 mb-4">We sent you an email to activate your Slasher account. Once you activate your account, you will be able to sign in.</h2>
      <p>The email was sent to</p>
      <p className="fs-3 text-primary fw-bold my-3">{emailAddress}</p>
      <p>
        Don’t see the account activation email? Be sure to check your spam folder.
      </p>
      <p>
        If you don’t receive the email within 30 minutes,
        {' '}
        <Link to="/app/verification-email-not-received" className="text-primary">click here.</Link>
      </p>
      <p>
        We look forward to seeing you on Slasher!
      </p>
      <Row className="d-flex justify-content-center">
        <Col sm={6} md={2}>
          <RoundButton id="sign-in-button" type="submit" className="w-100 my-3" variant="primary">
            Sign in
          </RoundButton>
        </Col>
      </Row>
      <div className="d-flex flex-md-row justify-content-center flex-column mt-3">
        <p className="fs-4">Need help?</p>
        <p className="fs-4">
          &nbsp;Email
          <a href="mailto:help@slasher.tv" className="text-decoration-none text-primary">
            help@slasher.tv
          </a>
        </p>
      </div>
    </div>
  );
}
export default RegistrationFinal;
