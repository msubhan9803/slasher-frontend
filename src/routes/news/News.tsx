import React from 'react';
import { Route, Routes } from 'react-router-dom';
import NewsIndex from './NewsIndex';
import NewsPartnerDetail from './partner/NewsPartnerDetail';
import NewsPartnerPost from './partner/NewsPartnerPost';

function News() {
  return (
    <Routes>
      <Route path="/" element={<NewsIndex />} />
      <Route path="/partner/:partnerId" element={<NewsPartnerDetail />} />
      <Route path="/partner/:partnerId/posts/:postId" element={<NewsPartnerPost />} />
    </Routes>
  );
}

export default News;
