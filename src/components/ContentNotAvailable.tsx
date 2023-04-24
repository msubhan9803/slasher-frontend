import React from 'react';
import { Link } from 'react-router-dom';

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
