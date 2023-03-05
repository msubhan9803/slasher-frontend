import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { activateAccount } from '../../api/users';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import useProgressButton from '../../components/ui/ProgressButton';

function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const verificationToken = searchParams.get('verificationToken');

  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setProgressButtonStatus('loading');
    activateAccount(email!, verificationToken!).then(() => {
      setProgressButtonStatus('success');
      navigate('/app/account-activated');
    }).catch((requestError: any) => {
      setProgressButtonStatus('failure');
      setErrorMessages(requestError.response.data.message);
    });
  };

  const renderContent = () => {
    if (!email || !verificationToken) {
      return 'Invalid activation URL.';
    }

    return (
      <Form>
        <p>Click the button below to activate your account.</p>
        <ErrorMessageList errorMessages={errorMessages} divClass="mt-3 text-start" className="m-0" />
        <ProgressButton label="Activate account" onClick={handleSubmit} className="mt-3 w-100" />
      </Form>
    );
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="text-center">
        <h1 className="mb-3">Activate Your Account</h1>
        {renderContent()}
      </div>
    </div>
  );
}

export default ActivateAccount;
