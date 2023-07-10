import React from 'react';
import { FriendRequestReaction, FriendType, User } from '../../../types';
import RoundButtonLink from '../RoundButtonLink';
import { acceptFriendsRequest, addFriend, rejectFriendsRequest } from '../../../api/friends';
import { useAppSelector } from '../../../redux/hooks';
import useProgressButton from '../ProgressButton';

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
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const friendRequestApi = (status: number | null) => {
    setProgressButtonStatus('loading');
    if (!status) {
      // eslint-disable-next-line no-param-reassign
      status = FriendRequestReaction.DeclinedOrCancelled;
    }
    if (user && user._id) {
      if (status === FriendRequestReaction.DeclinedOrCancelled) {
        addFriend(user._id).then(() => setFriendshipStatus(status));
        setProgressButtonStatus('success');
      } else if (status === FriendRequestReaction.Pending && friendData?.from !== loginUserId) {
        acceptFriendsRequest(user._id).then(() => setFriendshipStatus(status));
        setProgressButtonStatus('success');
      } else if ((
        status === FriendRequestReaction.Accepted
        || status === FriendRequestReaction.Pending
      )
      ) {
        rejectFriendsRequest(user._id).then(() => setFriendshipStatus(status));
        setProgressButtonStatus('success');
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
          <ProgressButton
            id="Friend-action-button"
            type="submit"
            onClick={() => friendRequestApi(friendStatus)}
            className="me-2 text-nowrap w-50"
            label={ButtonLabel}
          />
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
