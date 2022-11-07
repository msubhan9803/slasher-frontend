import React from 'react';
import { acceptFriendsRequest, rejectFriendsRequest } from '../../../../api/friends';
import { userInitialData } from '../../../../api/users';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { setUserInitialData } from '../../../../redux/slices/userSlice';
import FriendRequestItem from './FriendRequestItem';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

interface FriendRequest {
  profilePic: string;
  userName: string;
  _id: string;
}

function FriendRequests() {
  const friendRequests = useAppSelector((state) => state.user.friendRequests);
  const dispatch = useAppDispatch();

  const handleAcceptRequest = (userId: string) => {
    acceptFriendsRequest(userId)
      .then(() => userInitialData().then((res) => {
        dispatch(setUserInitialData(res.data));
      }));
  };
  const handleRejectRequest = (userId: string) => {
    rejectFriendsRequest(userId)
      .then(() => userInitialData().then((res) => {
        dispatch(setUserInitialData(res.data));
      }));
  };
  return (
    <div className="mt-5">
      <SidebarHeaderWithLink headerLabel="Friend requests" linkLabel="View All" linkTo="/" />
      {friendRequests && friendRequests.length > 0
        && friendRequests.map((request: FriendRequest, i: number) => (
          <FriendRequestItem
            /* eslint no-underscore-dangle: 0 */
            key={request._id}
            className={i + 1 < friendRequests.length ? 'mb-3' : ''}
            image={request.profilePic}
            userName={request.userName}
            id={request._id}
            onAcceptClick={handleAcceptRequest}
            onRejectClick={handleRejectRequest}
          />
        ))}
    </div>
  );
}

export default FriendRequests;
