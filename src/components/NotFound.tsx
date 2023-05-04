import React from 'react';
import { Link } from 'react-router-dom';

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
