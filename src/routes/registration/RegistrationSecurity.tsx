import React from 'react';
import { Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function RegistrationSecurity({ changeStep }: any) {
  const navigate = useNavigate();
  const handleStep = () => {
    // navigate('/registration/terms');
    // changeStep(2);
  };
  return (
    <div className="registration-security">
      <h1>Registration Security</h1>
      <p>This is the registration security page!</p>
      <Link to="/home">Go back to the home page</Link>
      <Button onClick={handleStep} className="w-100" variant="primary" type="submit">
        Next step
      </Button>
    </div>
  );
}

export default RegistrationSecurity;
