import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HashtagAdmin from './HashtagAdmin';

function Admin() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="hashtag" replace />} />
        <Route path="/hashtag" element={<HashtagAdmin />} />
      </Routes>
    </div>
  );
}

export default Admin;
