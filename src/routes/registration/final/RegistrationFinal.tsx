import React from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppSelector } from '../../../redux/hooks';

function RegistrationFinal() {
  const emailAddress = useAppSelector((state) => state.registration.email);
  return (
    <div className="text-center">
      <FontAwesomeIcon icon={regular('paper-plane')} size="6x" className="text-primary" />
      <h1 className="h2 mt-4">One more step!</h1>
      <h2 className="h3 mb-4">Verify your email</h2>
      <p>We have sent an email to</p>
      <p className="fs-3 text-primary fw-bold my-3">{emailAddress}</p>
      <p>
        Click or tap the button in the email to activate your
        Slasher account.
      </p>
      <p>
        If you do not receive the account activation email, be sure to check your junk or spam
        folder.
      </p>
      <p>
        We look forward to seeing you and hope you have a great time with us!
      </p>
      <div className="d-flex flex-md-row justify-content-center flex-column mt-5">
        <p className="fs-4">Need help?</p>
        <p className="fs-4">&nbsp;Please email help@slasher.tv for assistance.</p>
      </div>
    </div>
  );
}
export default RegistrationFinal;
