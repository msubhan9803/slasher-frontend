import React, { useState, useEffect, useRef } from 'react';
import {
  Col, Image, Row,
} from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { signIn } from '../../api/users';
import { setSignInCookies } from '../../utils/session-utils';
import slasherLogo from '../../images/slasher-beta-logo-medium.png';
import signInImageMobile from '../../images/sign-in-background-mobile.jpg';
import { LG_MEDIA_BREAKPOINT, SERVER_UNAVAILABLE_TIMEOUT } from '../../constants';
import SigninComponent from '../../components/ui/SigninComponent';
import useSessionToken from '../../hooks/useSessionToken';
import { setIsServerAvailable } from '../../redux/slices/serverAvailableSlice';
import { useAppDispatch } from '../../redux/hooks';
import useProgressButton from '../../components/ui/ProgressButton';
import { isDevelopmentServer } from '../../env';

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
    emailOrUsername: isDevelopmentServer ? 'slasher-test-user1@slasher.tv' : '',
    password: isDevelopmentServer ? '494sdsGSL001' : '',
  });
  const [searchParams] = useSearchParams();
  const token = useSessionToken();
  const dispatch = useAppDispatch();
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!token.isLoading && token.value) {
      navigate('/app/home', { replace: true });
    }
  }, [navigate, token]);

  const [errorMessage, setErrorMessage] = useState<string[]>();

  if (token.isLoading) { return null; }
  if (!token.isLoading && token.value) { return null; }

  const handleUserSignIn = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setProgressButtonStatus('loading');

    abortControllerRef.current = new AbortController();

    // Show <ServerUnavailable/> modal if signin request doesn't resove on expected time.
    const serverUnavailableTimeout = setTimeout(
      () => { abortControllerRef.current?.abort(); },
      SERVER_UNAVAILABLE_TIMEOUT,
    );
    const clearServerUnavailableTimeout = () => {
      clearTimeout(serverUnavailableTimeout);
    };

    // eslint-disable-next-line max-len
    signIn(credentials.emailOrUsername, credentials.password, abortControllerRef.current.signal).then(async (res) => {
      setErrorMessage([]);
      setSignInCookies(res.data.token, res.data.id, res.data.userName).finally(() => {
        const targetPath = searchParams.get('path');
        navigate(`${targetPath ?? '/app/home'}`);
      });
    }).catch((error) => {
      setProgressButtonStatus('failure');
      const isAborted = error.message === 'canceled';
      const isConnectionLost = error.message === 'Network Error';
      if (isConnectionLost || isAborted) {
        dispatch(setIsServerAvailable(false));
      } else {
        setErrorMessage(error.response.data.message);
      }
    }).finally(clearServerUnavailableTimeout);
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
            ProgressButton={ProgressButton}
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
