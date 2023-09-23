import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { User } from '../../../types';
import ProfileHeader from '../ProfileHeader';
import FollowingPeople from './FollowingPeople/FollowingPeople';

interface Props {
  user: User;
}

function ProfileFollowing({ user }: Props) {
  return (
    <div>
      <ProfileHeader tabKey="following" user={user} />
      <Routes>
        <Route path="/*" element={<Navigate to="people" replace />} />
        <Route path="people" element={<FollowingPeople />} />
      </Routes>
    </div>
  );
}

export default ProfileFollowing;
