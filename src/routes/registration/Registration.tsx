import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import RegistrationIdentity from './identity/RegistrationIdentity';
import RegistrationSecurity from './security/RegistrationSecurity';
import RegistrationTerms from './terms/RegistrationTerms';
import RegistrationFinal from './final/RegistrationFinal';
import NotFound from '../../components/NotFound';

function Registration() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="identity" replace />} />
      <Route path="/identity" element={<RegistrationIdentity activeStep={0} />} />
      <Route path="/security" element={<RegistrationSecurity activeStep={1} />} />
      <Route path="/terms" element={<RegistrationTerms activeStep={2} />} />
      <Route path="/final" element={<RegistrationFinal />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Registration;
