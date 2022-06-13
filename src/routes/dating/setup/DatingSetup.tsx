import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import NotFound from '../../../components/NotFound';
import DatingSetupAdditionalInfo from './additional-info/DatingSetupAdditionalInfo';
import DataingSetupAdditionalPreferences from './additional-preferences/DataingSetupAdditionalPreferences';
import DatingSetupAboutMe from './about-me/DatingSetupAboutMe';
import DatingSetupAddPhotos from './add-photos/DatingSetupAddPhotos';
import DatingSetupIdentity from './identity/DatingSetupIdentity';
import DatingPreferences from '../DatingPreferences';

function DatingSetup() {
  return (

    <Routes>
      <Route path="/" element={<Navigate to="identity" replace />} />
      <Route path="/identity" element={<DatingSetupIdentity />} />
      <Route path="/add-photos" element={<DatingSetupAddPhotos />} />
      <Route path="/about-me" element={<DatingSetupAboutMe />} />
      <Route path="/additional-preferences" element={<DataingSetupAdditionalPreferences />} />
      <Route path="/additional-info" element={<DatingSetupAdditionalInfo />} />
      <Route path="/dating-preferences" element={<DatingPreferences />} />
      <Route path="*" element={<AuthenticatedPageWrapper><NotFound /></AuthenticatedPageWrapper>} />
    </Routes>
  );
}

export default DatingSetup;
