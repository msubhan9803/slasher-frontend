import React from 'react';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';

function TempRightNavViewer() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-other-user">
      <h1 className="h3 mb-3">Right side nav viewer</h1>
    </AuthenticatedPageWrapper>
  );
}

export default TempRightNavViewer;
