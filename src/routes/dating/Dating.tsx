import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import DatingSetup from './setup/DatingSetup';
import DatingProfile from './profile/DatingProfile';
import NotFound from '../NotFound';
import DatingWelcome from './welcome/DatingWelcome';

function Dating() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="setup" replace />} />
      <Route path="/welcome" element={<DatingWelcome />} />
      <Route path="/setup/*" element={<DatingSetup />} />
      <Route path="/profile/*" element={<DatingProfile />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Dating;
