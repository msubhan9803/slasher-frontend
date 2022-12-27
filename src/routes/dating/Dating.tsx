import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import DatingSetup from './setup/DatingSetup';
import DatingProfile from './profile/DatingProfile';
import DatingWelcome from './welcome/DatingWelcome';
import NotFound from '../../components/NotFound';
import DatingPreferences from './preferences/DatingPreferences';
import DatingConversation from './conversation/DatingConversation';
import Likes from './likes/Likes';
import UnauthenticatedPageWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedPageWrapper';
import DatingTutorial from './tutorial/DatingTutorial';
import DatingMatch from './match/DatingMatch';
import DatingSubscription from './subscription/DatingSubscription';

function Dating() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="setup" replace />} />
      <Route path="/welcome" element={<DatingWelcome />} />
      <Route path="/preferences" element={<DatingPreferences />} />
      <Route path="/setup/*" element={<DatingSetup />} />
      <Route path="/profile/*" element={<DatingProfile />} />
      <Route path="/conversation" element={<DatingConversation />} />
      <Route path="/likes" element={<Likes />} />
      <Route path="/tutorial/*" element={<DatingTutorial />} />
      <Route path="/deck" element={<DatingMatch />} />
      <Route path="/deck" element={<DatingMatch />} />
      <Route path="/subscription/purchase" element={<DatingSubscription />} />
      <Route path="*" element={<UnauthenticatedPageWrapper><NotFound /></UnauthenticatedPageWrapper>} />
    </Routes>
  );
}

export default Dating;
