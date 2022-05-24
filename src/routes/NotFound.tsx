import React from 'react';
import { Link } from 'react-router-dom';
import UnauthenticatedSiteWrapper from '../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';

// TODO: Might want to make this component aware of user login state
// so that the correct site wrapper is used. Right now it's always
// using the UnauthenticatedSiteWrapper component.

function NotFound() {
  return (
    <UnauthenticatedSiteWrapper>
      <h1>Not Found</h1>
      <p>This Page could not be found.</p>
      <p>
        <Link to="/">Go back to the home page.</Link>
      </p>
    </UnauthenticatedSiteWrapper>
  );
}

export default NotFound;
