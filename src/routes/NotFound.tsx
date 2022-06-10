import React from 'react';
import UnauthenticatedSiteWrapper from '../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';
import NotFoundInnerContent from '../components/NotFoundPageContent';

// TODO: Might want to make this component aware of user login state
// so that the correct site wrapper is used. Right now it's always
// using the UnauthenticatedSiteWrapper component.

function NotFound() {
  return (
    <UnauthenticatedSiteWrapper>
      <NotFoundInnerContent />
    </UnauthenticatedSiteWrapper>
  );
}

export default NotFound;
