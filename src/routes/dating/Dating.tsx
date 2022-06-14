import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import DatingSetup from './setup/DatingSetup';
import DatingProfile from './profile/DatingProfile';
import DatingWelcome from './welcome/DatingWelcome';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import NotFound from '../../components/NotFound';
import DatingPreferences from './preferences/DatingPreferences';

function Dating() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="setup" replace />} />
      <Route path="/welcome" element={<DatingWelcome />} />
      <Route path="/preferences" element={<DatingPreferences />} />
      <Route path="/setup/*" element={<DatingSetup />} />
      <Route path="/profile/*" element={<DatingProfile />} />

      <Route path="*" element={<AuthenticatedPageWrapper><NotFound /></AuthenticatedPageWrapper>} />
    </Routes>
  );
}

export default Dating;
