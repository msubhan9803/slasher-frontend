import React from 'react';
import Cookies from 'js-cookie';
import RoundButton from '../RoundButton';
import { FriendRequestReaction, User } from '../../../types';
import RoundButtonLink from '../RoundButtonLink';
import { acceptFriendsRequest, addFriend, rejectFriendsRequest } from '../../../api/friends';

type FriendType = { from: string, to: string, reaction: FriendRequestReaction } | null;
const getButtonLabelForUser = (
  user: User,
  friend: FriendType,
  loginUserId: string | undefined,
) => {
  if (!friend || !loginUserId) {
    return '';
  }
  if (friend.reaction === FriendRequestReaction.Pending
    && friend.from === loginUserId
    && friend.to === user._id) {
    return 'Cancel pending request';
  }
  if (friend.reaction === FriendRequestReaction.Pending
    && friend.from === user._id
    && friend.to === loginUserId) {
    return 'Accept friend request';
  }
  if (friend.reaction === FriendRequestReaction.Accepted) {
    return 'Remove friend';
  }
  if (friend.reaction === FriendRequestReaction.DeclinedOrCancelled
    || friend.reaction === null) {
    return 'Add friend';
  }
  return '';
};

type Props = {
  friendStatus: FriendRequestReaction | null,
  user: User,
  friendData: FriendType,
  setFriendshipStatus: Function,
};
function FriendActionButtons({
  friendStatus, user, friendData, setFriendshipStatus,
} : Props) {
  const loginUserId = Cookies.get('userId');
  const friendRequestApi = (status: number | null) => {
    if (user && user._id) {
      if (status === FriendRequestReaction.DeclinedOrCancelled) {
        addFriend(user._id).then(() => setFriendshipStatus(status));
      } else if (status === FriendRequestReaction.Pending) {
        acceptFriendsRequest(user._id).then(() => setFriendshipStatus(status));
      } else if ((
        status === FriendRequestReaction.Accepted
          || status === FriendRequestReaction.Pending
      )) {
        rejectFriendsRequest(user._id).then(() => setFriendshipStatus(status));
      }
    }
  };
  const ButtonLabel = getButtonLabelForUser(user, friendData, loginUserId);
  return (
    <>
      {friendStatus === FriendRequestReaction.Accepted && <RoundButtonLink variant="black" to={`/app/messages/conversation/new?userId=${user?._id}`} className="me-2 px-4 border-1 border-primary">Send message</RoundButtonLink>}
      {ButtonLabel
      && (
        <RoundButton className="px-4 me-2 fs-3" variant={`${friendStatus === FriendRequestReaction.Pending || friendStatus === FriendRequestReaction.Accepted ? 'black' : 'primary'}`} onClick={() => friendRequestApi(friendStatus)}>
          {ButtonLabel}
        </RoundButton>
      )}
    </>
  );
}

export default FriendActionButtons;
