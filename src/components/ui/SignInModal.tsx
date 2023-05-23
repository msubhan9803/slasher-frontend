import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { UserCredentials } from '../../routes/sign-in/SignIn';
import SigninComponent from './SigninComponent';
import { signIn } from '../../api/users';
import { setSignInCookies } from '../../utils/session-utils';

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
  const closeModal = () => {
    setShow(false);
  };

  const handleUserSignIn = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    signIn(credentials.emailOrUsername, credentials.password).then((res) => {
      setErrorMessage([]);
      setSignInCookies(res.data.token, res.data.id, res.data.userName);
      const stateObj = { publicProfile: true };
      navigate(`/${userName}/about`, { state: stateObj });
    }).catch((error) => {
      setErrorMessage(error.response.data.message);
    });
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
