import React from 'react';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarViewer from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarViewer';

function TempRightNavViewer() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper className="container">
        <h1 className="h3 mb-3">Right side nav viewer</h1>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <RightSidebarViewer />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default TempRightNavViewer;
