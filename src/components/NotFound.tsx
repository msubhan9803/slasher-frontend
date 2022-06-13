import React from 'react';
import { Link } from 'react-router-dom';

// TODO: Might want to make this component aware of user login state
// so that the correct site wrapper is used. Right now it's always
// using the UnauthenticatedPageWrapper component.

function NotFound() {
  return (
    <div className="text-center">
      <h1>Not Found</h1>
      <p>This Page could not be found.</p>
      <p>
        <Link to="/">Go back to the home page.</Link>
      </p>
    </div>
  );
}

export default NotFound;
