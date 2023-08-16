import React, { useRef } from 'react';
import { acceptFriendsRequest, rejectFriendsRequest } from '../../../../api/friends';
import { userInitialData } from '../../../../api/users';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { forceReloadSuggestedFriends } from '../../../../redux/slices/suggestedFriendsSlice';
import { setFriendListReload, setUserInitialData } from '../../../../redux/slices/userSlice';
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
  const abortControllerRef = useRef<AbortController | null>();

  const handleAcceptRequest = (userId: string) => {
    if (abortControllerRef.current) {
      return;
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    acceptFriendsRequest(userId)
      .then(() => userInitialData().then((res) => {
        dispatch(setUserInitialData(res.data));
        dispatch(forceReloadSuggestedFriends());
        dispatch(setFriendListReload(true));
      })).finally(() => {
        abortControllerRef.current = null;
      });
  };
  const handleRejectRequest = (userId: string) => {
    rejectFriendsRequest(userId)
      .then(() => userInitialData().then((res) => {
        dispatch(setUserInitialData(res.data));
        dispatch(forceReloadSuggestedFriends());
        dispatch(setFriendListReload(true));
      }));
  };
  return (
    <div className="mt-5">
      {recentFriendRequests && recentFriendRequests.length > 0
        && (
          <>
            <SidebarHeaderWithLink headerLabel="Friend requests" linkLabel="View All" linkTo={`/${loginUserName}/friends/request`} />
            {
              recentFriendRequests.map((request: FriendRequest, i: number) => (
                <FriendRequestItem
                  key={request._id}
                  className={i + 1 < recentFriendRequests.length ? 'mb-3' : ''}
                  image={request.profilePic}
                  userName={request.userName}
                  id={request._id}
                  onAcceptClick={handleAcceptRequest}
                  onRejectClick={handleRejectRequest}
                />
              ))
            }
          </>
        )}
    </div>
  );
}

export default FriendRequests;
