import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RegistrationIdentity from './RegistrationIdentity';
import RegistrationSecurity from './RegistrationSecurity';

function Registration() {
  return (
    <div className="registration">
      <Routes>
        <Route path="/" element={<Navigate to="identity" replace />} />
        <Route path="identity" element={<RegistrationIdentity />} />
        <Route path="security" element={<RegistrationSecurity />} />
      </Routes>
    </div>
  );
}

export default Registration;
