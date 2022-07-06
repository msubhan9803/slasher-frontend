import React from 'react';
import { Route, Routes } from 'react-router-dom';
import NewsPartnerPost from './partner/NewsPartnerPost';

function News() {
  return (
    <Routes>
      <Route path="/partner/posts/1" element={<NewsPartnerPost />} />
    </Routes>
  );
}

export default News;
