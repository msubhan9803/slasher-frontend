import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Form,
  Row,
} from 'react-bootstrap';
import RoundButton from '../../../components/ui/RoundButton';
import RegistrationPageWrapper from '../components/RegistrationPageWrapper';

interface Props {
  activeStep: number;
}

function RegistrationIdentity({ activeStep }: Props) {
  const navigate = useNavigate();

  const handleStep = () => {
    navigate('/registration/security');
  };

  return (
    <RegistrationPageWrapper activeStep={activeStep}>
      <Form>
        <Row className="justify-content-center">
          <Form.Group className="col-md-4 mb-3 text-start">
            <Form.Control type="text" placeholder="First Name" />
            <p className="pt-2">
              This is how your first name will appear in your profile.
            </p>
          </Form.Group>

          <Form.Group className="col-md-4 mb-3 text-start">
            <Form.Control type="text" placeholder="Username" />
            <p className="pt-2">
              You can use letters (case sensitive), numbers, and the
              following special characters: “.”, “-”, or “_”.
            </p>
            <p>
              Special characters cannot be the first or last character of your username.
            </p>
            <p>
              This is how your username will appear when you post and comment on Slasher.
            </p>
          </Form.Group>

          <Form.Group className="col-md-4 mb-3 text-start">
            <Form.Control type="email" placeholder="Email address" />
            <p className="pt-2">
              We will send an email with an account activation link to this email address.
              Be sure to click the link in the email to activate your Slasher account. If
              you do not activate your account, you will not be able to login.
            </p>
          </Form.Group>

          <div className="col-md-4 my-5">
            <RoundButton onClick={handleStep} className="w-100" variant="primary" type="submit">
              Next step
            </RoundButton>
          </div>
          <div className="text-center fs-5">
            Already have an account?
            {' '}
            <Link to="/sign-in" className="text-primary">Click here</Link>
            {' '}
            to go to the sign in screen.
          </div>
        </Row>
      </Form>

    </RegistrationPageWrapper>
  );
}

export default RegistrationIdentity;
