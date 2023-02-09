import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ContentSidbarWrapper, ContentPageWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import NewsIndex from './NewsIndex';
import NewsPartnerDetail from './partner/NewsPartnerDetail';
import NewsPartnerPost from './partner/NewsPartnerPost';

function News() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Routes>
          <Route path="/" element={<NewsIndex />} />
          <Route path="/partner/:partnerId" element={<NewsPartnerDetail />} />
          <Route path="/partner/:partnerId/posts/:postId" element={<NewsPartnerPost />} />
        </Routes>
      </ContentPageWrapper>

      {/* Global right sidebar for all above routes */}
      <RightSidebarWrapper className="d-none d-lg-block">
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default News;
