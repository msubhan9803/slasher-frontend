import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import NotFound from '../../../components/NotFound';
import DatingPageWrapper from '../components/DatingPageWrapper';
import DatingEditProfile from './edit/DatingEditProfile';

function Dating() {
  return (
    <Routes>
      {/* TODO: Update redirect below when we have profile view page */}
      <Route path="/" element={<Navigate to="edit" replace />} />

      <Route path="/edit" element={<DatingEditProfile />} />

      <Route path="*" element={<DatingPageWrapper><NotFound /></DatingPageWrapper>} />
    </Routes>
  );
}

export default Dating;
