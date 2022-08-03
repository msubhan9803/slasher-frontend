import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ProfileHeader from '../ProfileHeader';

function ProfileAbout() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="about" />
      <h1>ProfileAbout</h1>
    </AuthenticatedPageWrapper>
  );
}

export default ProfileAbout;
