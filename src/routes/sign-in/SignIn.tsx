import React from 'react';
import { Link } from 'react-router-dom';
import UnauthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';

function SignIn() {
  return (
    <UnauthenticatedSiteWrapper>
      <h1>Sign In</h1>
      <p>This is a placeholder sign in page!</p>
      <p>
        <Link to="/">Go back to the home page</Link>
      </p>
    </UnauthenticatedSiteWrapper>
  );
}

export default SignIn;
