import React, { ChangeEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Form,
  Row,
} from 'react-bootstrap';
import RegistrationPageWrapper from '../components/RegistrationPageWrapper';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setIdentityFields } from '../../../redux/slices/registrationSlice';
import { validateRegistrationFields } from '../../../api/users';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import useProgressButton from '../../../components/ui/ProgressButton';

interface Props {
  activeStep: number;
}

function RegistrationIdentity({ activeStep }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const identityInfo = useAppSelector((state) => state.registration);
  const [errors, setErrors] = useState<string[]>([]);
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();

  const handleChange = (value: string, key: string) => {
    const registerInfoTemp = { ...identityInfo };
    (registerInfoTemp as any)[key] = value;
    dispatch(setIdentityFields(registerInfoTemp));
  };

  const validateAndGoToNextStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setProgressButtonStatus('loading');
    let errorList: string[] = [];

    const { firstName, userName, email } = identityInfo;

    try {
      const res = await validateRegistrationFields({ firstName, userName, email });
      if (res.data) { errorList = res.data; }
    } catch (requestError: any) {
      errorList = requestError.response.data.message;
    }

    setErrors(errorList);

    if (errorList.length > 0) {
      setProgressButtonStatus('failure');
      return;
    }

    setProgressButtonStatus('success');
    navigate('/app/registration/security');
  };
  return (
    <RegistrationPageWrapper activeStep={activeStep}>
      <Form>
        <Row className="justify-content-center">
          <Form.Group className="col-md-4 mb-3 text-start">
            <Form.Control
              aria-label="First Name"
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
              aria-label="Username"
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
            <p>
              You will not be able to change your username until after August 31, 2023.
            </p>
          </Form.Group>

          <Form.Group className="col-md-4 mb-3 text-start">
            <Form.Control
              aria-label="Email address"
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
          <ErrorMessageList errorMessages={errors} className="m-0" />
          <div className="col-md-4 my-5">
            <ProgressButton label="Next step" className="w-100" onClick={validateAndGoToNextStep} />
          </div>
          <div className="text-center fs-5">
            Already have an account?
            {' '}
            <Link to="/app/sign-in" className="text-primary">Click here</Link>
            {' '}
            to go to the sign in screen.
          </div>
        </Row>
      </Form>

    </RegistrationPageWrapper>
  );
}

export default RegistrationIdentity;
