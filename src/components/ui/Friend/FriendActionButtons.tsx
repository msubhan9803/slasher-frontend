import React, { useState } from 'react';
import { FriendRequestReaction, FriendType, User } from '../../../types';
import RoundButtonLink from '../RoundButtonLink';
import { acceptFriendsRequest, addFriend, rejectFriendsRequest } from '../../../api/friends';
import { useAppSelector } from '../../../redux/hooks';
import useProgressButton from '../ProgressButton';
import ReportModal from '../ReportModal';
import { sleep } from '../../../utils/timer-utils';

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
  const [show, setShow] = useState<boolean>(false);

  const friendRequestApi = async (status: number | null) => {
    setProgressButtonStatus('loading');
    if (!status) {
      // eslint-disable-next-line no-param-reassign
      status = FriendRequestReaction.DeclinedOrCancelled;
    }
    if (user && user._id) {
      if (status === FriendRequestReaction.DeclinedOrCancelled) {
        return addFriend(user._id).then(() => {
          setFriendshipStatus(status);
          setProgressButtonStatus('default');
        })
          /* eslint-disable no-console */
          .catch((error) => {
            console.error(error);
            setProgressButtonStatus('failure');
          });
      }
      if (status === FriendRequestReaction.Pending && friendData?.from !== loginUserId) {
        return acceptFriendsRequest(user._id).then(() => {
          setFriendshipStatus(status);
          setProgressButtonStatus('default');
        })
          /* eslint-disable no-console */
          .catch((error) => {
            console.error(error);
            setProgressButtonStatus('failure');
          });
        setProgressButtonStatus('default');
      }
      if ((
        status === FriendRequestReaction.Accepted
        || status === FriendRequestReaction.Pending
      )
      ) {
        return rejectFriendsRequest(user._id).then(async () => {
          setFriendshipStatus(status);
          setProgressButtonStatus('default');
          await sleep(500);
          setShow(false);
        })
          /* eslint-disable no-console */
          .catch(async (error) => {
            console.error(error);
            setProgressButtonStatus('failure');
            await sleep(500);
            setShow(false);
          });
      }
    }
    return undefined;
  };
  const ButtonLabel = getButtonLabelForUser(user, friendData, loginUserId);

  let showFriendActionButtons = true;
  if (showOnlyAddAndSend) {
    showFriendActionButtons = friendData?.reaction === FriendRequestReaction.DeclinedOrCancelled
      || friendData?.reaction === null;
  }
  const handleFriendRequest = (label: string) => {
    if (label === 'Remove friend') {
      setShow(true);
    } else {
      friendRequestApi(friendStatus);
    }
  };
  const onRemoveFriendClickAsync = async () => {
    await friendRequestApi(friendStatus);
  };
  return (
    <>
      {friendStatus === FriendRequestReaction.Accepted && <RoundButtonLink variant="black" to={`/app/messages/conversation/new?userId=${user?._id}`} className={`me-2 text-nowrap ${buttonType === 'send-message' ? '' : 'border-1 border-primary'}`}>Send message</RoundButtonLink>}
      {
        showFriendActionButtons && ButtonLabel
        && (
          <ProgressButton
            variant={`${friendStatus === FriendRequestReaction.Pending || friendStatus === FriendRequestReaction.Accepted ? 'black' : 'primary'}`}
            id="Friend-action-button"
            type="submit"
            onClick={
              () => handleFriendRequest(ButtonLabel)
            }
            className="me-2 text-nowrap"
            label={ButtonLabel}
          />
        )
      }
      {
        show
        && (
          <ReportModal
            show={show}
            setShow={setShow}
            slectedDropdownValue="Remove friend"
            onConfirmClickAsync={onRemoveFriendClickAsync}
            ProgressButton={ProgressButton}
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
