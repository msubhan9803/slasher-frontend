import React, { useState } from 'react';
import {
  Col, Form, Image, Row,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import signIn from '../../images/sign-in.png';
import UnauthenticatedPageWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedPageWrapper';
import RoundButtonLink from '../../components/ui/RoundButtonLink';
import RoundButton from '../../components/ui/RoundButton';
import CustomInputGroup from '../../components/ui/CustomInputGroup';
import ErrorMessageList from '../../components/ui/ErrorMessageList';

interface UserSignIn {
  emailOrUsername: string;
  password: string;
}

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<UserSignIn>({
    emailOrUsername: '',
    password: '',
  });
  const passwordVisiblility = () => {
    setShowPassword(!showPassword);
  };
  const [errorMessage, setErrorMessage] = useState<string[]>([]);

  const handleSignIn = (event: React.ChangeEvent<HTMLInputElement>) => {
    const userInfo = { ...user, [event.target.name]: event.target.value };
    setUser(userInfo);
  };

  const userSignIn = () => {
    const body = {
      ...user,
      device_id: '1',
      device_token: 'wewewewew',
      device_type: 'mobile',
      app_version: '1.0',
      device_version: '2.9',
    };

    fetch(`${process.env.REACT_APP_API_URL}users/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.statusCode === 401) {
          setErrorMessage(data.message);
        } else {
          setErrorMessage([]);
        }
      });
  };

  return (
    <UnauthenticatedPageWrapper hideTopLogo>
      <Row className="align-items-center">
        <Col sm={12} md={7}>
          <div className="login-img text-center pb-4">
            <Image src={signIn} className="w-75" />
          </div>
        </Col>
        <Col sm={12} md={5} lg={5}>
          <Row className="mt-3 mt-sm-0">
            <div>
              <h1 className="h2 text-center mb-4 mt-5">Sign In</h1>
              <Form>
                <CustomInputGroup
                  size="lg"
                  addonContent={<FontAwesomeIcon icon={solid('user')} size="lg" />}
                  label="Username or email"
                  inputType="email"
                  name="emailOrUsername"
                  value={user.emailOrUsername}
                  onChangeValue={handleSignIn}
                />
                <CustomInputGroup
                  size="lg"
                  addonContent={<FontAwesomeIcon icon={solid('lock')} size="lg" />}
                  label="Password"
                  inputType={showPassword ? 'text' : 'password'}
                  password
                  showPassword={showPassword}
                  name="password"
                  passwordVisiblility={passwordVisiblility}
                  value={user.password}
                  onChangeValue={handleSignIn}
                />

                <p className="text-center fs-5">
                  Forgot your password?&nbsp;
                  <Link to="/forgot-password" className="text-primary">
                    Click here
                  </Link>
                </p>
                {errorMessage.length > 0 && <ErrorMessageList errorMessages={errorMessage} />}
                <RoundButton onClick={userSignIn} className="w-100 my-3" variant="primary">
                  Sign in
                </RoundButton>
                <p className="text-center">OR</p>
                <RoundButtonLink to="/registration" className="w-100" variant="primary">
                  Create an account
                </RoundButtonLink>

                <p className="mt-3">
                  NOTE: If you just created an account and you are not able to login,
                  be sure you activated your account by clicking
                  the button in the email we sent when you created your account.

                  <i>
                    Your account will not be activated until you click the button in that email.
                  </i>
                  <br />
                  <br />
                  Please check your spam folder for the email.
                  If you have not received it, please&nbsp;
                  <Link to="/sign-in" className="text-primary">click here.</Link>
                </p>
              </Form>
            </div>
          </Row>
        </Col>
      </Row>
    </UnauthenticatedPageWrapper>
  );
}

export default SignIn;
