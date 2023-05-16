import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { activateAccount } from '../../api/users';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { sleep } from '../../utils/timer-utils';

function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const [activationInProgress, setActivationInProgress] = useState<boolean>(!!(userId && token));
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<string[]>();

  useEffect(() => {
    (async () => {
      const delayPromise = sleep(1000);

      try {
        // Wait for delay to finish so that we guarantee that the loading animation doesn't
        // flash and then disappear too quickly.
        await activateAccount(userId!, token!);
        setSuccess(true);
      } catch (requestError: any) {
        setErrorMessages(requestError.response.data.message);
      }
      await delayPromise;
      setActivationInProgress(false);
    })();
  }, [token, userId]);

  const renderHeading = () => {
    if (activationInProgress || !success) {
      return <h1 className="mb-3">Activate Your Account</h1>;
    }
    return <h1 className="mb-3">Account Activated!</h1>;
  };

  const renderContent = () => {
    if (!userId || !token) {
      return 'Invalid activation URL.';
    }

    if (activationInProgress) {
      return (
        <div>
          <p>Activation in progress...</p>
          <LoadingIndicator />
        </div>
      );
    }

    if (success) {
      return (
        <div>
          <p>You have successfully activated your account!</p>
          <p>
            <Link to="/app/sign-in" className="text-primary text-decoration-none">Click here</Link>
            {' '}
            to sign in.
          </p>
        </div>
      );
    }

    return (
      <ErrorMessageList errorMessages={errorMessages} divClass="mt-3 text-start" className="m-0" />
    );
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="text-center">
        {renderHeading()}
        {renderContent()}
      </div>
    </div>
  );
}

export default ActivateAccount;
