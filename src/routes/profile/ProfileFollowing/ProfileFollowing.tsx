import React from 'react';
import { User } from '../../../types';
import ProfileHeader from '../ProfileHeader';

interface Props {
  user: User;
}

function ProfileFollowing({ user }: Props) {
  return (
    <div>
      <ProfileHeader tabKey="following" user={user} />

    </div>
  );
}

export default ProfileFollowing;
