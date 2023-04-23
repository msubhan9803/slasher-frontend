import React from 'react';
import { Link } from 'react-router-dom';

function PasswordResetSuccess() {
  return (
    <div className="d-flex justify-content-center">
      <div className="text-center">
        <h1 className="mb-3">Password Reset Complete!</h1>
        <p>You have successfully reset your password!</p>
        <p>
          <Link to="/app/sign-in" className="text-primary text-decoration-none">Click here</Link>
          {' '}
          to sign in with your new password.
        </p>
      </div>
    </div>
  );
}

export default PasswordResetSuccess;
