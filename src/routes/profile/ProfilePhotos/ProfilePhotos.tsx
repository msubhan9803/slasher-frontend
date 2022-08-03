import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ProfileHeader from '../ProfileHeader';

function ProfilePhotos() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="photos" />
      <h1>ProfilePhotos</h1>
    </AuthenticatedPageWrapper>
  );
}

export default ProfilePhotos;
