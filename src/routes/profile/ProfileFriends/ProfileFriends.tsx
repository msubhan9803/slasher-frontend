import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ProfileHeader from '../ProfileHeader';

function ProfileFriends() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="friends" />
      <h1>ProfileFriends</h1>
    </AuthenticatedPageWrapper>
  );
}

export default ProfileFriends;
