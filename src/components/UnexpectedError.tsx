import React from 'react';
import RoundButtonLink from './ui/RoundButtonLink';

function UnexpectedError() {
  return (
    <div className="text-center">
      <h1>The unexpected has happened...</h1>
      <p>The app has encountered an unexpected error.</p>
      <p>
        <RoundButtonLink variant="primary" to="/">Click here to return to the home screen</RoundButtonLink>
      </p>
    </div>
  );
}

export default UnexpectedError;
