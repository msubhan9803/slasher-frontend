import React from 'react';
import { useAppSelector } from '../../../../redux/hooks';
import FriendRequestItem from './FriendRequestItem';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

interface FriendRequest {
  profilePic: string;
  userName: string;
}

function FriendRequests() {
  const friendRequests = useAppSelector((state) => state.user.friendRequests);
  return (
    <div className="mt-5">
      <SidebarHeaderWithLink headerLabel="Friend requests" linkLabel="View All" linkTo="/" />
      {friendRequests && friendRequests.length > 0
        && friendRequests.map((request: FriendRequest, i: number) => (
          <FriendRequestItem
            key={request.userName}
            className={i + 1 < friendRequests.length ? 'mb-3' : ''}
            image={request.profilePic}
            userName={request.userName}
          />
        ))}
    </div>
  );
}

export default FriendRequests;
