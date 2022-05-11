import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home">
      <h1>Home</h1>
      <p>This is a placeholder home page!</p>
      <p>
        <Link to="/registration">Go to the registration page</Link>
      </p>
    </div>
  );
}

export default Home;
