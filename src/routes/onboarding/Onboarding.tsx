import React from 'react';
import { Route, Routes } from 'react-router-dom';
import OnboardingPhoto from './photo/OnboardingPhoto';

function Onboarding() {
  return (
    <Routes>
      <Route path="/photo" element={<OnboardingPhoto />} />
    </Routes>
  );
}

export default Onboarding;
