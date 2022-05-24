import React from 'react';
import { Link } from 'react-router-dom';
import AuthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedSiteWrapper';

function Home() {
  return (
    <AuthenticatedSiteWrapper>
      <div className="home">
        <h1>Home</h1>
        <p>This is a placeholder home page!</p>
        <p>
          <Link to="/registration">Go to the registration page</Link>
        </p>
      </div>
    </AuthenticatedSiteWrapper>
  );
}

export default Home;
