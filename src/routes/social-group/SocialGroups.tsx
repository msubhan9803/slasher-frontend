import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ContentSidbarWrapper, ContentPageWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import GroupsList from './groups-all/GroupsList';
import GroupsDetail from './groups-detail/GroupsDetail';
import GroupsHome from './groups-home/GroupsHome';
import SticyBannerAdSpaceCompensation from '../../components/SticyBannerAdSpaceCompensation';

function SocialGroups() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Routes>
          <Route path="home" element={<GroupsHome />} />
          <Route path="all" element={<GroupsList />} />
          <Route path=":groupId" element={<GroupsDetail />} />
          <Route path="*" element={<Navigate to="home" replace />} />
        </Routes>
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>

      {/* Global right sidebar for all above routes */}
      <RightSidebarWrapper>
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default SocialGroups;
