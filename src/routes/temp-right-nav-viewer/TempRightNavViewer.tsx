import React from 'react';
import AuthenticatedRigthSideNavViewerWrapper from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarNavViewerWrapper';

function TempRightNavViewer() {
  return (
    <AuthenticatedRigthSideNavViewerWrapper>
      <div className="home">
        <h1>Right side nav viewer</h1>
      </div>
    </AuthenticatedRigthSideNavViewerWrapper>
  );
}

export default TempRightNavViewer;
