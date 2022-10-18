import React, { useState, useEffect } from 'react';
import {
  Col, Form, Image, Row,
} from 'react-bootstrap';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import signInImage from '../../images/sign-in.png';
import UnauthenticatedPageWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedPageWrapper';
import RoundButtonLink from '../../components/ui/RoundButtonLink';
import RoundButton from '../../components/ui/RoundButton';
import CustomInputGroup from '../../components/ui/CustomInputGroup';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import { signIn } from '../../api/users';
import { setSignInCookies } from '../../utils/session-utils';

interface UserCredentials {
  emailOrUsername: string;
  password: string;
}

function SignIn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState<UserCredentials>({
    emailOrUsername: '',
    password: '',
  });

  useEffect(() => {
    if (Cookies.get('sessionToken')) {
      navigate('/home');
    }
  }, []);
  const passwordVisiblility = () => {
    setShowPassword(!showPassword);
  };
  const [errorMessage, setErrorMessage] = useState<string[]>();

  const handleSignIn = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
  };

  const handleUserSignIn = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    signIn(credentials.emailOrUsername, credentials.password).then((res) => {
      setErrorMessage([]);
      setSignInCookies(res.data.token, res.data.id);
      navigate('/home');
    }).catch((error) => {
      setErrorMessage(error.response.data.message);
    });
  };

  return (
    <UnauthenticatedPageWrapper hideTopLogo>
      <Row className="align-items-center">
        <Col sm={12} md={7}>
          <div className="login-img text-center pb-4">
            <Image src={signInImage} className="w-75" />
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
                  autoComplete="username"
                  value={credentials.emailOrUsername}
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
                  autoComplete="current-password"
                  passwordVisiblility={passwordVisiblility}
                  value={credentials.password}
                  onChangeValue={handleSignIn}
                />

                <p className="text-center fs-5">
                  Forgot your password?&nbsp;
                  <Link to="/forgot-password" className="text-primary">
                    Click here
                  </Link>
                </p>
                {errorMessage && errorMessage.length > 0 && (
                  <ErrorMessageList errorMessages={errorMessage} className="m-0" />
                )}
                <RoundButton id="sign-in-button" type="submit" onClick={handleUserSignIn} className="w-100 my-3" variant="primary">
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
