import React, { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Row } from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import RoundButton from '../../components/ui/RoundButton';
import { getSuggestFriends } from '../../api/users';
import { addFriend, rejectFriendsRequest, removeSuggestedFriend } from '../../api/friends';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import UserCircleImage from '../../components/ui/UserCircleImage';
import { setSuggestedFriendsState } from '../../redux/slices/suggestedFriendsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';

const StyleFriend = styled(Row)`
  overflow-x: auto;
  overflow-y: hidden;
  .casts-image {
    aspect-ratio: 1;
  }
  &::-webkit-scrollbar {
    display: none;
}
`;
const Card = styled.div`
  height:12.857rem;
  width:11.71rem;
  padding-right: 1rem;
`;

const slideFriendRight = () => {
  const slider = document.getElementById('slideFriend');
  if (slider !== null) {
    slider.scrollLeft += 300;
  }
};
const slideFriendLeft = () => {
  const slider = document.getElementById('slideFriend');
  if (slider !== null) {
    slider.scrollLeft -= 300;
  }
};
function SuggestedFriend() {
  const dispatch: any = useAppDispatch();
  const [allowReload, setAllowReload] = useState(true);
  const [loading, setLoading] = useState(false);
  const {
    forceReload, lastRetrievalTime, suggestedFriends,
  } = useAppSelector((state) => state.suggestedFriendList);

  const reloadSuggestedFriends = useCallback(() => {
    setLoading(true);
    getSuggestFriends()
      .then((res) => {
        const friendPayload = {
          forceReload: false,
          lastRetrievalTime: DateTime.now().toISO(),
          suggestedFriends: res.data,
        };
        dispatch(setSuggestedFriendsState(friendPayload));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    if (
      allowReload
      && (
        forceReload
        || !lastRetrievalTime
        || DateTime.now().diff(DateTime.fromISO(lastRetrievalTime)).as('minutes') > 5
      )
    ) {
      reloadSuggestedFriends();
    }
    setAllowReload(false);
  }, [allowReload, forceReload, lastRetrievalTime, reloadSuggestedFriends]);

  if (loading) {
    return <LoadingIndicator />;
  }

  const addFriendClick = (userId: string) => {
    addFriend(userId).then(() => {
      const newSuggestedFriends = suggestedFriends.map((friend: any) => {
        if (friend._id === userId) {
          return { ...friend, addFriend: true };
        }
        return friend;
      });
      const friendPayload = {
        forceReload: true,
        suggestedFriends: newSuggestedFriends,
        lastRetrievalTime,
      };
      dispatch(setSuggestedFriendsState(friendPayload));
    });
  };

  const cancelFriendClick = (userId: string) => {
    rejectFriendsRequest(userId).then(() => {
      const newSuggestedFriends = suggestedFriends.map((friend: any) => {
        if (friend._id === userId) {
          return { ...friend, addFriend: false };
        }
        return friend;
      });
      const friendPayload = {
        forceReload: true,
        suggestedFriends: newSuggestedFriends,
        lastRetrievalTime,
      };
      dispatch(setSuggestedFriendsState(friendPayload));
    });
  };

  const onCloseClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>, userId: string) => {
    e.preventDefault();
    removeSuggestedFriend(userId).then(() => {
      const newSuggestedFriends = suggestedFriends.filter((friend: any) => friend._id !== userId);
      const friendPayload = {
        forceReload: true,
        suggestedFriends: newSuggestedFriends,
        lastRetrievalTime,
      };
      dispatch(setSuggestedFriendsState(friendPayload));
      if (newSuggestedFriends.length === 0) {
        setAllowReload(true);
      }
    });
  };

  const renderNoSuggestionsAvailable = () => (
    <div className="mb-3">
      No friend suggestions available right now, but check back later for more!
    </div>
  );

  return (
    <div>
      {!suggestedFriends || suggestedFriends.length === 0 ? renderNoSuggestionsAvailable() : (
        <div className="p-md-3 pt-md-1 rounded-2">
          <div className="d-flex align-items-center">
            <Button aria-label="chevron left icon" className="d-block p-0 prev bg-transparent border-0 shadow-none" onClick={slideFriendLeft}>
              <FontAwesomeIcon icon={solid('chevron-left')} size="lg" className="text-white" />
            </Button>
            <StyleFriend
              id="slideFriend"
              className="d-flex flex-nowrap w-100 mx-3 g-0"
            >
              {suggestedFriends.map((user: any) => (
                <Card key={user._id}>
                  <div className="bg-dark rounded p-2">
                    <Link className="text-decoration-none" to={`/${user.userName}/about`}>
                      <div className=" d-flex justify-content-center position-relative">
                        <UserCircleImage size="6.25rem" src={user.profilePic} alt="suggested friend" />
                        <div className="position-absolute" style={{ right: '0' }}>
                          <FontAwesomeIcon role="button" onClick={(e: React.MouseEvent<SVGSVGElement, MouseEvent>) => { onCloseClick(e, user._id); }} icon={solid('xmark')} size="lg" />
                        </div>
                      </div>
                      <p className="text-center my-2">{user.userName}</p>
                    </Link>
                    {user.addFriend
                      ? (
                        <RoundButton variant="black" className="w-100 fs-3" onClick={() => cancelFriendClick(user._id)}>
                          Cancel Request
                        </RoundButton>
                      )
                      : (
                        <RoundButton className="w-100 fs-3" onClick={() => addFriendClick(user._id)}>
                          Add friend
                        </RoundButton>
                      )}
                  </div>
                </Card>
              ))}
            </StyleFriend>
            <Button aria-label="chevron right icon" className="d-block p-0 next bg-transparent border-0 shadow-none" onClick={slideFriendRight}>
              <FontAwesomeIcon icon={solid('chevron-right')} size="lg" className="text-white" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuggestedFriend;
