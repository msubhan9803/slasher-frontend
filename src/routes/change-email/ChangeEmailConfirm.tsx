import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import useProgressButton from '../../components/ui/ProgressButton';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import { emailChangeConfirm } from '../../api/users/email-change';
import RoundButtonLink from '../../components/ui/RoundButtonLink';

function ChangeEmailConfirm() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setProgressButtonStatus('loading');
    emailChangeConfirm(
      userId!,
      token!,
    ).then((response) => {
      setProgressButtonStatus('success');
      setSuccessMessage(response.data.message);
    }).catch((requestError: any) => {
      setProgressButtonStatus('failure');
      setErrorMessages(requestError.response.data.message);
    });
  };

  const renderContent = () => {
    if (!userId || !token) {
      return 'Invalid confirmation URL.';
    }

    if (successMessage) {
      return (
        <>
          <p className="text-center mt-3">{successMessage}</p>
          <Row className="justify-content-center">
            <Col sm={7} md={6}>
              <RoundButtonLink to="/app/sign-in" variant="primary" className="mt-2 w-100">Click here to continue</RoundButtonLink>
            </Col>
          </Row>
        </>
      );
    }

    return (
      <>
        <p className="text-center mt-3">Click the button below to confirm your new email address.</p>
        <Row className="justify-content-center">
          <Col sm={7} md={6}>
            <ErrorMessageList errorMessages={errorMessages} divClass="mt-2" className="m-0" />
            <ProgressButton label="Confirm" onClick={handleSubmit} className="mt-2 w-100" />
          </Col>
        </Row>
      </>
    );
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="text-center">
        <h1 className="mb-3">Confirm Your New Email Address</h1>
        {renderContent()}
      </div>
    </div>
  );
}

export default ChangeEmailConfirm;
