import React from 'react';
import RoundButton from '../RoundButton';
import { FriendRequestReaction, FriendType, User } from '../../../types';
import RoundButtonLink from '../RoundButtonLink';
import { acceptFriendsRequest, addFriend, rejectFriendsRequest } from '../../../api/friends';
import { useAppSelector } from '../../../redux/hooks';

const getButtonLabelForUser = (
  user: User,
  friend: FriendType,
  loginUserId: string | undefined,
) => {
  if (!friend || !loginUserId || loginUserId === user._id) {
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
  showOnlyAddAndSend?: boolean,
  buttonType?: string,
};
function FriendActionButtons({
  friendStatus, user, friendData, setFriendshipStatus, showOnlyAddAndSend = false,
  buttonType,
}: Props) {
  const loginUserId = useAppSelector((state) => state.user.user.id);

  const friendRequestApi = (status: number | null) => {
    if (!status) {
      // eslint-disable-next-line no-param-reassign
      status = FriendRequestReaction.DeclinedOrCancelled;
    }
    if (user && user._id) {
      if (status === FriendRequestReaction.DeclinedOrCancelled) {
        addFriend(user._id).then(() => setFriendshipStatus(status));
      } else if (status === FriendRequestReaction.Pending && friendData?.from !== loginUserId) {
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

  let show = true;
  if (showOnlyAddAndSend) {
    show = friendData?.reaction === FriendRequestReaction.DeclinedOrCancelled
      || friendData?.reaction === null;
  }
  return (
    <>
      {friendStatus === FriendRequestReaction.Accepted && <RoundButtonLink variant="black" to={`/app/messages/conversation/new?userId=${user?._id}`} className={`me-2 text-nowrap ${buttonType === 'send-message' ? '' : 'border-1 border-primary'}`}>Send message</RoundButtonLink>}
      {
        show && ButtonLabel
        && (
          <RoundButton className="me-2 text-nowrap" variant={`${friendStatus === FriendRequestReaction.Pending || friendStatus === FriendRequestReaction.Accepted ? 'black' : 'primary'}`} onClick={() => friendRequestApi(friendStatus)}>
            {ButtonLabel}
          </RoundButton>
        )
      }
    </>
  );
}

FriendActionButtons.defaultProps = {
  showOnlyAddAndSend: false,
  buttonType: '',
};

export default FriendActionButtons;
