import React, { useState, useEffect } from 'react';
import {
  Col, Form, Image, Row,
} from 'react-bootstrap';
import Cookies from 'js-cookie';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import signInImage from '../../images/sign-in.png';
import styled from 'styled-components';
import RoundButtonLink from '../../components/ui/RoundButtonLink';
import RoundButton from '../../components/ui/RoundButton';
import CustomInputGroup from '../../components/ui/CustomInputGroup';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import { signIn } from '../../api/users';
import { setSignInCookies } from '../../utils/session-utils';
import slasherLogo from '../../images/slasher-logo-medium.png';
import signInImageMobile from '../../images/sign-in-background-mobile.jpg';
import { LG_MEDIA_BREAKPOINT } from '../../constants';

interface UserCredentials {
  emailOrUsername: string;
  password: string;
}

const StyledDesktopSlasherLogo = styled(Image)`
  height: 16rem;
`;
const StyledMobileSlasherLogo = styled(Image)`
  display: inline-block;
  margin: 0 -1rem;
`;

const LoginFormWrapper = styled.div`
  .form-inner-content {
    padding: 3rem;
  }

  @media(min-width: ${LG_MEDIA_BREAKPOINT}) {
    min-width: 450px;
    width: 95%;
    max-width: 650px;

    .form-inner-content {
      padding: 3.5rem 6rem;
    }
  }
`;

function SignIn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState<UserCredentials>({
    emailOrUsername: '',
    password: '',
  });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (Cookies.get('sessionToken')) {
      navigate('/app/home');
    }
  }, [navigate]);
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
      setSignInCookies(res.data.token, res.data.id, res.data.userName);
      const targetPath = searchParams.get('path');
      navigate(`${targetPath ?? '/app/home'}`);
    }).catch((error) => {
      setErrorMessage(error.response.data.message);
    });
  };

  return (
    <Row>
      <Col sm={12} lg={6}>
        <div className="h-100 w-100 d-flex align-items-center">
          <div className="d-flex w-100 h-100 justify-content-center align-items-center">
            <StyledMobileSlasherLogo src={signInImageMobile} className="w-100 d-lg-none" />
            <StyledDesktopSlasherLogo src={slasherLogo} className="p-4 d-none d-lg-block" />
          </div>
        </div>
      </Col>
      <Col sm={12} lg={6}>
        <LoginFormWrapper className="bg-secondary bg-mobile-transparent mx-auto">
          <div className="form-inner-content justify-content-center">
            <h1 className="h2 text-center mb-4">Sign In</h1>
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

              <p className="text-center fs-5 text-light">
                Forgot your password?&nbsp;
                <Link to="/app/forgot-password" className="text-primary">
                  Click here
                </Link>
              </p>
              <ErrorMessageList errorMessages={errorMessage} className="m-0" />
              <RoundButton id="sign-in-button" type="submit" onClick={handleUserSignIn} className="w-100 my-3" variant="primary">
                Sign in
              </RoundButton>
              <p className="text-center">OR</p>
              <RoundButtonLink to="/app/registration" className="w-100" variant="primary">
                Create an account
              </RoundButtonLink>

              <p className="mt-3 text-center text-light">
                NOTE: If you just created an account and you are not able to login,
                be sure you activated your account by clicking
                the button in the email we sent when you created your account.

                <em>
                  Your account will not be activated until you click the link in that email.
                </em>
              </p>
              <p className="text-center mb-0 text-light">
                Please check your spam folder for the email.
                If you have not received it, please&nbsp;
                <Link to="/app/verification-email-not-received" className="text-primary">click here.</Link>
              </p>
            </Form>
          </div>
        </LoginFormWrapper>
      </Col>
    </Row>
  );
}

export default SignIn;
