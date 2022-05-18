import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home">
      <h1>Not Found</h1>
      <p>This Page could not be found.</p>
      <p>
        <Link to="/">Go back to the home page.</Link>
      </p>
    </div>
  );
}

export default Home;
