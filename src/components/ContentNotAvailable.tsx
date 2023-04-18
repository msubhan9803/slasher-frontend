import React from 'react';
import { Link } from 'react-router-dom';

// TODO: Might want to make this component aware of user login state
// so that the correct site wrapper is used. Right now it's always
// using the UnauthenticatedPageWrapper component.

function ContentNotAvailable() {
  return (
    <div className="text-center">
      <h1>Not Found</h1>
      <p>This content is no longer available.</p>
      <p>
        <Link to="/">Go back to the home page.</Link>
      </p>
    </div>
  );
}

export default ContentNotAvailable;
