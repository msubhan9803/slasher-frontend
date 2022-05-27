import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UnauthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';
import RegistrationIdentity from './RegistrationIdentity';
import RegistrationSecurity from './RegistrationSecurity';

function Registration() {
  return (
    <UnauthenticatedSiteWrapper>
      <div className="registration">
        <Routes>
          <Route path="/" element={<Navigate to="identity" replace />} />
          <Route path="identity" element={<RegistrationIdentity />} />
          <Route path="security" element={<RegistrationSecurity />} />
        </Routes>
      </div>
    </UnauthenticatedSiteWrapper>
  );
}

export default Registration;
