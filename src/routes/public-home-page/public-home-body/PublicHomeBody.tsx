import React from 'react';
import AboutApp from './AboutApp';
import DownloadAppSection from './DownloadAppSection';
import HeroSection from './HeroSection';
import PublicSignIn from './PublicSignIn';
import UserReview from './UserReview';

function PublicHomeBody({ children }: any) {
  return (
    <div>
      {children || (
        <div style={{ backgroundColor: '#171717' }}>
          <HeroSection />
          <AboutApp />
          <DownloadAppSection />
          <UserReview />
          <PublicSignIn />
        </div>
      )}
    </div>

  );
}

export default PublicHomeBody;
