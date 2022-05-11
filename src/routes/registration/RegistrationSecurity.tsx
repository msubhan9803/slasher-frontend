import React from 'react';
import { Link } from 'react-router-dom';

function RegistrationSecurity() {
  return (
    <div className="registration-security">
      <h1>Registration Security</h1>
      <p>This is the registration security page!</p>
      <Link to="/home">Go back to the home page</Link>
    </div>
  );
}

export default RegistrationSecurity;
