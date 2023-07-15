import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import styled from '@emotion/styled';
import { Button, Row } from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import RoundButton from '../../components/ui/RoundButton';
import { getSuggestFriends } from '../../api/users';
import { addFriend, removeSuggestedFriend } from '../../api/friends';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import UserCircleImage from '../../components/ui/UserCircleImage';
import { setSuggestedFriendsState } from '../../redux/slices/suggestedFriendsSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';

const StyleFriend = styled(Row)`
  overflow-x: auto;
  overflow-y: hidden;
  .casts-image { aspect-ratio: 1; }
  &::-webkit-scrollbar { display: none; }
`;
const Card = styled.div`
  height:12.857rem;
  width:10.33rem;
  padding-right: 1rem;
`;

const LoadingIndicatorSpacer = styled.div`
  height:12.857rem;
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
  const abortControllerRef = useRef<AbortController | null>();

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

  const addFriendClick = (userId: string) => {
    if (abortControllerRef.current) {
      return;
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    addFriend(userId).then(() => {
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
    }).finally(() => {
      abortControllerRef.current = null;
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
    <div className="ms-3 ms-md-0" style={{ marginBottom: 50 }}>
      No friend suggestions available right now, but check back later for more!
    </div>
  );

  if (loading) {
    return (
      <div className="p-md-3 pt-md-1 ">
        <LoadingIndicatorSpacer className="d-flex align-items-center justify-content-center">
          <LoadingIndicator />
        </LoadingIndicatorSpacer>
      </div>
    );
  }

  return (
    <div>
      {!suggestedFriends || suggestedFriends.length === 0 ? renderNoSuggestionsAvailable() : (
        <div className="p-md-3 pt-md-1 rounded-2">
          <div className="d-flex align-items-center position-relative">
            <Button tabIndex={0} aria-label="chevron left icon" className="position-absolute d-block p-0 prev bg-transparent border-0" onClick={slideFriendLeft}>
              <FontAwesomeIcon icon={solid('chevron-left')} size="lg" className="text-white" />
            </Button>
            <Button tabIndex={0} aria-label="chevron right icon" style={{ right: 0 }} className="position-absolute d-block p-0 next bg-transparent border-0" onClick={slideFriendRight}>
              <FontAwesomeIcon icon={solid('chevron-right')} size="lg" className="text-white" />
            </Button>
            <StyleFriend
              id="slideFriend"
              className="d-flex flex-nowrap w-100 mx-4 g-0"
              tabIndex={-1}
            >
              {suggestedFriends.map((user: any) => (
                <Card key={user._id}>
                  <div className="bg-dark rounded p-2">
                    <Link className="d-block text-decoration-none" to={`/${user.userName}/about`}>
                      <div className=" d-flex justify-content-center position-relative">
                        <UserCircleImage size="6.25rem" src={user.profilePic} alt="suggested friend" />
                        <Button variant="link" className="position-absolute p-0 px-1" style={{ right: '0' }} onClick={(e: any) => onCloseClick(e, user._id)}>
                          <FontAwesomeIcon icon={solid('xmark')} size="lg" />
                          <span className="visually-hidden">Dismiss suggestion</span>
                        </Button>
                      </div>
                      <p className="text-center my-2 text-truncate">{user.userName}</p>
                    </Link>
                    <RoundButton className="w-100" onClick={() => addFriendClick(user._id)}>
                      Add friend
                    </RoundButton>
                  </div>
                </Card>
              ))}
            </StyleFriend>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuggestedFriend;
