import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import DatingSetup from './setup/DatingSetup';
import DatingProfile from './profile/DatingProfile';
import DatingWelcome from './welcome/DatingWelcome';
import AuthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedSiteWrapper';
import NotFound from '../../components/NotFound';

function Dating() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="setup" replace />} />
      <Route path="/welcome" element={<DatingWelcome />} />
      <Route path="/setup/*" element={<DatingSetup />} />
      <Route path="/profile/*" element={<DatingProfile />} />

      <Route path="*" element={<AuthenticatedSiteWrapper><NotFound /></AuthenticatedSiteWrapper>} />
    </Routes>
  );
}

export default Dating;
