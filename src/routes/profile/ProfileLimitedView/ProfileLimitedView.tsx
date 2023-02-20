import React from 'react';
import ProfileHeader from '../ProfileHeader';
import { User } from '../../../types';

interface Props {
  user: User
}
function ProfileLimitedView({ user }: Props) {
  return (
    <div>
      <ProfileHeader showTabs={false} user={user} />
      <div className="bg-dark rounded p-4 my-3">
        This profile is private. Only friends can view this content.
      </div>
    </div>
  );
}

export default ProfileLimitedView;
