import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ProfileHeader from '../ProfileHeader';

function ProfileWatchList() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="watchedList" />
      <h1>ProfileWatchList</h1>
    </AuthenticatedPageWrapper>
  );
}

export default ProfileWatchList;
