import React, { useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { UserCredentials } from '../../routes/sign-in/SignIn';
import SigninComponent from './SigninComponent';
import { signIn } from '../../api/users';
import { setSignInCookies } from '../../utils/session-utils';
import useProgressButton from './ProgressButton';
import { SERVER_UNAVAILABLE_TIMEOUT } from '../../constants';
import { setIsServerAvailable } from '../../redux/slices/serverAvailableSlice';
import { useAppDispatch } from '../../redux/hooks';

const StyledModal = styled(Modal)`
.modal-content {
  background: #171717;
  border:0;
  border-radius:0;
  padding:20px;
}
`;
interface SignInProps {
  show: boolean;
  setShow: (value: boolean) => void;
  isPublicProfile?: boolean;
}
function SignInModal({ show, setShow, isPublicProfile }: SignInProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [credentials, setCredentials] = useState<UserCredentials>({
    emailOrUsername: '',
    password: '',
  });
  const { userName } = useParams();
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const abortControllerRef = useRef<AbortController | null>(null);
  const dispatch = useAppDispatch();

  const closeModal = () => {
    setShow(false);
  };

  const handleUserSignIn = (e: React.MouseEvent<HTMLElement>) => {
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
    signIn(credentials.emailOrUsername, credentials.password, abortControllerRef.current.signal).then((res) => {
      setProgressButtonStatus('success');
      setErrorMessage([]);
      setSignInCookies(res.data.token, res.data.id, res.data.userName);
      const stateObj = { publicProfile: true };
      navigate(`/${userName}/about`, { state: stateObj });
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
    <StyledModal
      show={show}
      centered
      onHide={closeModal}
    >
      <Modal.Header className="border-0 shadow-none justify-content-end" closeButton />
      <Modal.Title className="text-primary text-center px-5 mx-4 h1">Please sign in or create an account.</Modal.Title>
      <Modal.Body>
        <SigninComponent
          ProgressButton={ProgressButton}
          credential={credentials}
          setCredential={setCredentials}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          handleUserSignIn={handleUserSignIn}
          errorMessage={errorMessage}
          isPublicProfile={isPublicProfile}
        />
      </Modal.Body>
    </StyledModal>
  );
}

SignInModal.defaultProps = {
  isPublicProfile: false,
};
export default SignInModal;
