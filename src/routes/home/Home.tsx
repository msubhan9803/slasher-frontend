import React from 'react';
import { Link } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';

function Home() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <h1 className="h3 mb-3">Home</h1>
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
        <br />
        <Link to="/dating/setup/identity">Dating Setup - Identity</Link>
        <br />
        <Link to="/dating/preferences">Dating Preferences</Link>
        <br />
        <Link to="/right-nav-viewer">Right Nav Viewer</Link>
      </p>
    </AuthenticatedPageWrapper>
  );
}

export default Home;
