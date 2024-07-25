import React, { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import NotFound from '../../components/NotFound';
import CreateBusinessListing from './create-post/CreateBusinessListing';
import { ContentSidbarWrapper, ContentPageWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import SticyBannerAdSpaceCompensation from '../../components/SticyBannerAdSpaceCompensation';
import RightSidebarViewer from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarViewer';
import { useAppSelector } from '../../redux/hooks';
import { ProfileSubroutesCache, User } from '../../types';
import { getPageStateCache } from '../../pageStateCache';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';

function BusinessListings() {
  const location = useLocation();

  const [user, setUser] = useState<User | undefined>(
    getPageStateCache<ProfileSubroutesCache>(location)?.user,
  );
  const loginUserData = useAppSelector((state) => state.user.user);
  const isSelfProfile = loginUserData.id === user?._id;

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Routes>
          <Route path="create" element={<CreateBusinessListing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>

      {/* Global right sidebar for all above routes */}
      {/* <RightSidebarWrapper>
        {isSelfProfile && user ? <RightSidebarSelf /> : <RightSidebarViewer user={user} />}
      </RightSidebarWrapper> */}

      <RightSidebarWrapper>
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default BusinessListings;
