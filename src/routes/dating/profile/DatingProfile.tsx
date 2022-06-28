import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import NotFound from '../../../components/NotFound';
import DatingPageWrapper from '../components/DatingPageWrapper';
import DatingProfileEdit from './edit/DatingProfileEdit';

function DatingProfile() {
  return (
    <Routes>
      {/* TODO: Update redirect below when we have profile view page */}
      <Route path="/" element={<Navigate to="edit" replace />} />

      <Route path="/edit" element={<DatingProfileEdit />} />

      <Route path="*" element={<DatingPageWrapper><NotFound /></DatingPageWrapper>} />
    </Routes>
  );
}

export default DatingProfile;
