import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import NotFound from '../../../components/NotFound';
import DatingSetupAdditionalInfo from './additional-info/DatingSetupAdditionalInfo';
import DataingSetupAdditionalPreferences from './DataingSetupAdditionalPreferences';
import DatingSetupAboutMe from './DatingSetupAboutMe';
import DatingSetupAddPhotos from './DatingSetupAddPhotos';
import DatingSetupIdentity from './DatingSetupIdentity';

function DatingSetup() {
  return (

    <Routes>
      <Route path="/" element={<Navigate to="identity" replace />} />
      <Route path="/identity" element={<DatingSetupIdentity />} />
      <Route path="/add-photos" element={<DatingSetupAddPhotos />} />
      <Route path="/about-me" element={<DatingSetupAboutMe />} />
      <Route path="/additional-preferences" element={<DataingSetupAdditionalPreferences />} />
      <Route path="/additional-info" element={<DatingSetupAdditionalInfo />} />

      <Route path="*" element={<AuthenticatedPageWrapper><NotFound /></AuthenticatedPageWrapper>} />
    </Routes>
  );
}

export default DatingSetup;
