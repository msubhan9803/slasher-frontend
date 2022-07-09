import React from 'react';
import { Route, Routes } from 'react-router-dom';
import NewsIndex from './NewsIndex';
import NewsPartnerDetail from './partner/NewsPartnerDetail';

function News() {
  return (
    <Routes>
      <Route path="/" element={<NewsIndex />} />
      <Route path="/partner/:partnerId" element={<NewsPartnerDetail />} />
    </Routes>
  );
}

export default News;
