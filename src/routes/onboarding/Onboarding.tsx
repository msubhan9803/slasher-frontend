import React from 'react';
import { Route, Routes } from 'react-router-dom';
import NotFound from '../../components/NotFound';
import OnboardingAboutMe from './about-me/OnboardingAboutMe';
import OnboardingHashtag from './hashtag/OnboardingHashtag';
import OnboardingPhoto from './photo/OnboardingPhoto';

function Onboarding() {
  return (
    <Routes>
      <Route path="/photo" element={<OnboardingPhoto />} />
      <Route path="/about-me" element={<OnboardingAboutMe />} />
      <Route path="/hashtag" element={<OnboardingHashtag />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Onboarding;
