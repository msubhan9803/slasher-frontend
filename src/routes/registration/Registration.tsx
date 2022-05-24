import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedSiteWrapper';
import RegistrationIdentity from './RegistrationIdentity';
import RegistrationSecurity from './RegistrationSecurity';

function Registration() {
  return (
    <AuthenticatedSiteWrapper>
      <div className="registration">
        <Routes>
          <Route path="/" element={<Navigate to="identity" replace />} />
          <Route path="identity" element={<RegistrationIdentity />} />
          <Route path="security" element={<RegistrationSecurity />} />
        </Routes>
      </div>
    </AuthenticatedSiteWrapper>
  );
}

export default Registration;
