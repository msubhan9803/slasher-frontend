import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HashtagAdmin from './HashtagAdmin';
import LisitingManagementAdmin from './LisitingManagementAdmin';

function Admin() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="hashtag" replace />} />
        <Route path="/hashtag" element={<HashtagAdmin />} />
        <Route path="/listing-management" element={<LisitingManagementAdmin />} />
      </Routes>
    </div>
  );
}

export default Admin;
