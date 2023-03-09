import React from 'react';
import AvailableSection from './AvailableSection';
import DownloadAppSection from './DownloadAppSection';
import HeroSection from './HeroSection';
import UserReview from './UserReview';

function PublicHomeBody() {
  return (
    <div className="bg-dark">
      <HeroSection />
      <AvailableSection />
      <DownloadAppSection />
      <UserReview />
    </div>
  );
}

export default PublicHomeBody;
