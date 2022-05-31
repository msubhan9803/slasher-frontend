import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Form,
  Row,
} from 'react-bootstrap';
import RoundButton from '../../components/ui/RoundButton';

function RegistrationIdentity({ changeStep }: any) {
  const navigate = useNavigate();

  const handleStep = () => {
    navigate('/registration/security');
    changeStep(1);
  };

  return (
    <Container className="mt-4 align-self-center text-center">

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

          <div className="col-md-4 mt-5">
            <RoundButton onClick={handleStep} className="w-100" variant="primary" type="submit">
              Next step
            </RoundButton>
          </div>
        </Row>
      </Form>

    </Container>
  );
}

export default RegistrationIdentity;
