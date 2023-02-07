import React from 'react';
import { acceptFriendsRequest, rejectFriendsRequest } from '../../../../api/friends';
import { userInitialData } from '../../../../api/users';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { forceReloadSuggestedFriends } from '../../../../redux/slices/suggestedFriendsSlice';
import { setUserInitialData } from '../../../../redux/slices/userSlice';
import FriendRequestItem from './FriendRequestItem';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

interface FriendRequest {
  profilePic: string;
  userName: string;
  _id: string;
}

function FriendRequests() {
  const recentFriendRequests = useAppSelector((state) => state.user.recentFriendRequests);
  const loginUserName = useAppSelector((state) => state.user.user.userName);
  const dispatch = useAppDispatch();

  const handleAcceptRequest = (userId: string) => {
    acceptFriendsRequest(userId)
      .then(() => userInitialData().then((res) => {
        dispatch(setUserInitialData(res.data));
        dispatch(forceReloadSuggestedFriends());
      }));
  };
  const handleRejectRequest = (userId: string) => {
    rejectFriendsRequest(userId)
      .then(() => userInitialData().then((res) => {
        dispatch(setUserInitialData(res.data));
        dispatch(forceReloadSuggestedFriends());
      }));
  };
  return (
    <div className="mt-5">
      <SidebarHeaderWithLink headerLabel="Friend requests" linkLabel="View All" linkTo={`/${loginUserName}/friends/request`} />
      {recentFriendRequests && recentFriendRequests.length > 0
        && recentFriendRequests.map((request: FriendRequest, i: number) => (
          <FriendRequestItem
            /* eslint no-underscore-dangle: 0 */
            key={request._id}
            className={i + 1 < recentFriendRequests.length ? 'mb-3' : ''}
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
