import React from 'react';
import { Link } from 'react-router-dom';

function AccountActivated() {
  return (
    <div className="d-flex justify-content-center">
      <div className="text-center">
        <h1 className="mb-3">Account Activated!</h1>
        <p>You have successfully activated your account!</p>
        <p>
          <Link to="/sign-in" className="text-primary text-decoration-none">Click here </Link>
          {' '}
          to sign in.
        </p>
      </div>
    </div>
  );
}

export default AccountActivated;
