import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { User } from '../../../types';
import ProfileHeader from '../ProfileHeader';
import FollowingHashtags from './FollowingHashtags/FollowingHashtags';

interface Props {
  user: User;
}

function ProfileFollowing({ user }: Props) {
  return (
    <div>
      <ProfileHeader tabKey="following" user={user} />
      <Routes>
        <Route path="/*" element={<Navigate to="hashtags" replace />} />
        <Route path="hashtags" element={<FollowingHashtags />} />
      </Routes>
    </div>
  );
}

export default ProfileFollowing;
