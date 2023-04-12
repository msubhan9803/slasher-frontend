import React from 'react';
import AboutApp from './AboutApp';
import DownloadAppSection from './DownloadAppSection';
import HeroSection from './HeroSection';
import PublicSignIn from './PublicSignIn';
import UserReview from './UserReview';

function PublicHomeBody() {
  return (
    <div className="bg-black">
      <HeroSection />
      <AboutApp />
      <DownloadAppSection />
      <UserReview />
      <PublicSignIn />
    </div>
  );
}

export default PublicHomeBody;
