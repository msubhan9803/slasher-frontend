import React, { useState, useEffect } from 'react';
import {
  Col, Image, Row,
} from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { signIn } from '../../api/users';
import { setSignInCookies } from '../../utils/session-utils';
import slasherLogo from '../../images/slasher-beta-logo-medium.png';
import signInImageMobile from '../../images/sign-in-background-beta-mobile.jpg';
import { LG_MEDIA_BREAKPOINT } from '../../constants';
import SigninComponent from '../../components/ui/SigninComponent';
import useSessionToken from '../../hooks/useSessionToken';
import { sleep } from '../../utils/timer-utils';
import { setServerAvailable } from '../../redux/slices/serverAvailableSlice';
import { useAppDispatch } from '../../redux/hooks';

export interface UserCredentials {
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

export const LoginFormWrapper = styled.div`
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
  const token = useSessionToken();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!token.isLoading && token.value) {
      navigate('/app/home');
    }
  }, [navigate, token]);

  const [errorMessage, setErrorMessage] = useState<string[]>();

  if (token.isLoading) { return null; }

  const handleUserSignIn = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    signIn(credentials.emailOrUsername, credentials.password).then(async (res) => {
      await sleep(1000);
      setErrorMessage([]);
      setSignInCookies(res.data.token, res.data.id, res.data.userName).finally(() => {
        const targetPath = searchParams.get('path');
        navigate(`${targetPath ?? '/app/home'}`);
      });
    }).catch((error) => {
      const isConnectionLost = error.message === 'Network Error';
      if (isConnectionLost) {
        dispatch(setServerAvailable(false));
      } else {
        setErrorMessage(error.response.data.message);
      }
    });
  };

  return (
    <Row>
      <Col sm={12} lg={6}>
        <div className="h-100 w-100 d-flex align-items-center">
          <div className="d-flex w-100 h-100 justify-content-center align-items-center">
            <StyledMobileSlasherLogo src={signInImageMobile} alt="Slasher logo" className="w-100 d-lg-none" />
            <StyledDesktopSlasherLogo src={slasherLogo} alt="Slasher logo" className="p-4 d-none d-lg-block" />
          </div>
        </div>
      </Col>
      <Col sm={12} lg={6}>
        <LoginFormWrapper className="bg-secondary bg-mobile-transparent mx-auto">
          <SigninComponent
            credential={credentials}
            setCredential={setCredentials}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleUserSignIn={handleUserSignIn}
            errorMessage={errorMessage}
          />
        </LoginFormWrapper>
      </Col>
    </Row>
  );
}

export default SignIn;
