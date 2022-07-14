import React from 'react';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';

function TempRightNavViewer() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-other-user">
      <div className="home">
        <h1>Right side nav viewer</h1>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default TempRightNavViewer;
