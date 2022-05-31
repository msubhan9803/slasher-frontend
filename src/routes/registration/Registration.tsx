import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RegistrationIdentity from './RegistrationIdentity';
import RegistrationSecurity from './RegistrationSecurity';
import RegistrationTerms from './RegistrationTerms';
import UnauthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';

function Registration() {
  return (
    <UnauthenticatedSiteWrapper>
      <div className="registration">
        <Routes>
          <Route path="/" element={<Navigate to="identity" replace />} />
          <Route path="identity" element={<RegistrationIdentity />} />
          <Route path="security" element={<RegistrationSecurity />} />
          <Route path="terms" element={<RegistrationTerms />} />
        </Routes>
      </div>
    </UnauthenticatedSiteWrapper>
  );
}

export default Registration;
