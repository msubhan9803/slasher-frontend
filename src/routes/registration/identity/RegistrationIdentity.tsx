import React, { ChangeEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Form,
  Row,
} from 'react-bootstrap';
import RegistrationPageWrapper from '../components/RegistrationPageWrapper';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setIdentityFields } from '../../../redux/slices/registrationSlice';
import RoundButton from '../../../components/ui/RoundButton';
import { checkUserEmail, checkUserName } from '../../../api/users';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';

interface Props {
  activeStep: number;
}

function RegistrationIdentity({ activeStep }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const identityInfo = useAppSelector((state) => state.registration);
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (value: string, key: string) => {
    const registerInfoTemp = { ...identityInfo };
    (registerInfoTemp as any)[key] = value;
    dispatch(setIdentityFields(registerInfoTemp));
  };

  const validateAndGoToNextStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let errorList: string[] = [];

    try {
      await checkUserName(identityInfo.userName);
    } catch (requestError: any) {
      errorList = errorList.concat(requestError.response.data.message);
    }

    try {
      await checkUserEmail(identityInfo.email);
    } catch (requestError: any) {
      errorList = errorList.concat(requestError.response.data.message);
    }

    setErrors(errorList);

    if (errorList.length > 0) {
      return;
    }

    navigate('/registration/security');
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
          {errors.length > 0 && <ErrorMessageList errorMessages={errors} className="m-0" />}
          <div className="col-md-4 my-5">
            <RoundButton
              variant="primary"
              className="w-100"
              type="submit"
              onClick={validateAndGoToNextStep}
            >
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
