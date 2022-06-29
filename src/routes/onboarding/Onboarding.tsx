import React from 'react';
import { Route, Routes } from 'react-router-dom';
import OnboardingAboutMe from './about-me/OnboardingAboutMe';
import OnboardingPhoto from './photo/OnboardingPhoto';

function Onboarding() {
  return (
    <Routes>
      <Route path="/photo" element={<OnboardingPhoto />} />
      <Route path="/about-me" element={<OnboardingAboutMe />} />
    </Routes>
  );
}

export default Onboarding;
