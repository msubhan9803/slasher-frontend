import React from 'react';
import { Link } from 'react-router-dom';
import AuthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedSiteWrapper';

function Home() {
  return (
    <AuthenticatedSiteWrapper>
      <div className="home">
        <h1>Home</h1>
        <p>This is a placeholder home page!</p>
        <p>Here are a few sample links for testing:</p>
        <p>
          <Link to="/sign-in">Sign in</Link>
          <br />
          <Link to="/forgot-password">Forgot password</Link>
          <br />
          <Link to="/verification-email-not-received">Verification Email Not Received</Link>
          <br />
          <Link to="/registration">Registration</Link>
        </p>
      </div>
    </AuthenticatedSiteWrapper>
  );
}

export default Home;
