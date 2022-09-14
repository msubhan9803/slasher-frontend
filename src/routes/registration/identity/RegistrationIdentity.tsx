import React, { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Form,
  Row,
} from 'react-bootstrap';
import RegistrationPageWrapper from '../components/RegistrationPageWrapper';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import { setIdentityFields } from '../../../redux/slices/registrationSlice';

interface Props {
  activeStep: number;
}

function RegistrationIdentity({ activeStep }: Props) {
  const dispatch = useAppDispatch();
  const identityInfo = useAppSelector((state) => state.registration);

  const handleChange = (value: string, key: string) => {
    const registerInfoTemp = { ...identityInfo };
    (registerInfoTemp as any)[key] = value;
    dispatch(setIdentityFields(registerInfoTemp));
  };
  return (
    <RegistrationPageWrapper activeStep={activeStep}>
      <Form>
        <Row className="justify-content-center">
          <Form.Group className="col-md-4 mb-3 text-start">
            <Form.Control
              type="text"
              placeholder="First Name"
              value={identityInfo.firstName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'firstName')}
            />
            <p className="pt-2">
              This is how your first name will appear in your profile.
            </p>
          </Form.Group>

          <Form.Group className="col-md-4 mb-3 text-start">
            <Form.Control
              type="text"
              placeholder="Username"
              value={identityInfo.userName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'userName')}
            />
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
            <Form.Control
              type="email"
              placeholder="Email address"
              value={identityInfo.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'email')}
            />
            <p className="pt-2">
              We will send an email with an account activation link to this email address.
              Be sure to click the link in the email to activate your Slasher account. If
              you do not activate your account, you will not be able to login.
            </p>
          </Form.Group>

          <div className="col-md-4 my-5">
            <RoundButtonLink
              to="/registration/security"
              variant="primary"
              className="w-100"
            >
              Next step
            </RoundButtonLink>
          </div>
          <div className="text-center fs-5">
            Already have an account?
            <Link to="/sign-in" className="text-primary">Click here</Link>
            to go to the sign in screen.
          </div>
        </Row>
      </Form>

    </RegistrationPageWrapper>
  );
}

export default RegistrationIdentity;
