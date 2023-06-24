import React from 'react';
import AboutApp from './AboutApp';
import NowAvailableSection from './NowAvailableSection';
import HeroSection from './HeroSection';
import PublicSignIn from './PublicSignIn';
import UserReview from './UserReview';
import { enableDevFeatures } from '../../../constants';

function PublicHomeBody({ children }: any) {
  return (
    <div>
      {children || (
        <div style={{ backgroundColor: '#171717' }}>
          <HeroSection />
          <AboutApp />
          <NowAvailableSection />
          <UserReview />
          {enableDevFeatures
            && <PublicSignIn />}
        </div>
      )}
    </div>

  );
}

export default PublicHomeBody;
