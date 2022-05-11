import React from 'react';
import { Link } from 'react-router-dom';

function RegistrationIdentity() {
  return (
    <div className="registration-identity">
      <h1>Registration Identity</h1>
      <p>This is the registration identity page!</p>
      <Link to="/registration/security">Go to the registration security page</Link>
    </div>
  );
}

export default RegistrationIdentity;
