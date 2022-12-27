import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import NotFound from '../../../components/NotFound';
import DatingPageWrapper from '../components/DatingPageWrapper';
import DatingProfileEdit from './edit/DatingProfileEdit';
import DatingProfileDetails from './View/DatingProfileView';

function DatingProfile() {
  return (
    <Routes>
      {/* TODO: Update redirect below when we have profile view page */}
      <Route path="/" element={<Navigate to="edit" replace />} />

      <Route path="/edit" element={<DatingProfileEdit />} />
      <Route path="/:datingUserId" element={<DatingProfileDetails />} />

      <Route path="*" element={<DatingPageWrapper><NotFound /></DatingPageWrapper>} />
    </Routes>
  );
}

export default DatingProfile;
