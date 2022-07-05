import React from 'react';
import { Route, Routes } from 'react-router-dom';
import NewsPartnerDetail from './PartnerDetail/NewsPartnerDetail';

function News() {
  return (
    <Routes>
      <Route path="/partner/1" element={<NewsPartnerDetail />} />
    </Routes>
  );
}

export default News;
