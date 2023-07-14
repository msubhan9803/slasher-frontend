import React from 'react';
import RoundButtonLink from './ui/RoundButtonLink';

function NotFound() {
  return (
    <div className="text-center">
      <h1>Something weird has happened...</h1>
      <p>The content you are looking for could not be found.</p>
      <p>
        <RoundButtonLink variant="primary" to="/">Click here to return to the home screen</RoundButtonLink>
      </p>
    </div>
  );
}

export default NotFound;
