import React from 'react';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarViewer from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarViewer';
import { User } from '../../types';

function TempRightNavViewer() {
  const user: User = {
    id: '507f1f77bcf86cd799439011',
    aboutMe: 'I am Mock User',
    firstName: 'Mock',
    email: 'mock@slasher.com',
    userName: 'mockUser',
    profilePic: '',
    profile_status: 2,
    coverPhoto: '',
  };

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <h1 className="h3 mb-3">Right side nav viewer</h1>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <RightSidebarViewer user={user} />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default TempRightNavViewer;
