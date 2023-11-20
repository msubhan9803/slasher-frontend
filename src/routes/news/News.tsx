import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import PostDetail from '../../components/ui/post/PostDetail';
import NewsIndex from './NewsIndex';
import NewsPartnerDetail from './partner/NewsPartnerDetail';

function News() {
  return (
    <ContentSidbarWrapper>
      <Routes>
        <Route path="/" element={<NewsIndex />} />
        <Route path="/partner/:partnerId" element={<NewsPartnerDetail />} />
        <Route path="/partner/:partnerId/posts/:postId" element={<PostDetail postType="news" showAdAtPageBottom />} />
      </Routes>

    </ContentSidbarWrapper>
  );
}

export default News;
