/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { Col, Row } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';
import { useLocation, useParams } from 'react-router-dom';
import { acceptFriendsRequest, rejectFriendsRequest, userProfileFriendsRequest } from '../../../../api/friends';
import ErrorMessageList from '../../../../components/ui/ErrorMessageList';
import LoadingIndicator from '../../../../components/ui/LoadingIndicator';
import TabLinks from '../../../../components/ui/Tabs/TabLinks';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { resetNewFriendRequestCountCount, setFriendListReload, setUserRecentFriendRequests } from '../../../../redux/slices/userSlice';
import { ProfileSubroutesCache, User } from '../../../../types';
import ProfileHeader from '../../ProfileHeader';
import FriendsProfileCard from '../FriendsProfileCard';
import { forceReloadSuggestedFriends } from '../../../../redux/slices/suggestedFriendsSlice';
import ProfileTabContent from '../../../../components/ui/profile/ProfileTabContent';
import socketStore from '../../../../socketStore';
import { hasPageStateCache, setPageStateCache } from '../../../../pageStateCache';
import { PROFILE_SUBROUTES_DEFAULT_CACHE, getProfileSubroutesCache } from '../../profileSubRoutesCacheUtils';

interface FriendProps {
  _id?: string;
  id: string;
  firstName?: string;
  userName: string;
  profilePic: string;
}

interface Props {
  user: User
}
function ProfileFriendRequest({ user }: Props) {
  const dispatch = useAppDispatch();
  const params = useParams();
  const isFriendReLoad = useAppSelector((state) => state.user.forceFriendListReload);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const loginUserName = useAppSelector((state) => state.user.user.userName);
  const friendsReqCount = useAppSelector((state) => state.user.user.newFriendRequestCount);
  const friendRequestContainerElementRef = useRef<any>(null);
  const [loadingFriendRequests, setLoadingFriendRequests] = useState<boolean>(false);
  const [additionalFriendRequest, setAdditionalFriendRequest] = useState<boolean>(false);
  const location = useLocation();
  const { socket } = socketStore;
  const profileSubRoutesCache = getProfileSubroutesCache(location);
  const [friendsReqList, setFriendsReqList] = useState<FriendProps[]>(
    profileSubRoutesCache?.friendRequests?.data || [],
  );
  const [friendRequestPage, setFriendRequestPage] = useState<number>(
    profileSubRoutesCache?.friendRequests?.page || 0,
  );

  const friendsTabs = [
    { value: '', label: 'All friends' },
    { value: 'request', label: 'Friend requests', badge: friendsReqCount },
  ];
  const initalFriendRequest = () => {
    userProfileFriendsRequest(0)
      .then((res) => {
        setFriendsReqList(res.data);
      });
  };

  useEffect(() => {
    socket?.emit('clearNewFriendRequestCount', {});
    dispatch(resetNewFriendRequestCountCount());
  }, [dispatch, socket]);

  useEffect(() => {
    if (isFriendReLoad) {
      initalFriendRequest();
      dispatch(setFriendListReload(false));
      setFriendRequestPage(1);
      setNoMoreData(false);
    }
  }, [isFriendReLoad, dispatch]);

  useEffect(() => {
    dispatch(setUserRecentFriendRequests(friendsReqList.slice(0, 3)));
  }, [friendsReqList, dispatch]);

  const fetchMoreFriendReqList = useCallback(() => {
    userProfileFriendsRequest(friendRequestPage)
      .then((res) => {
        setFriendsReqList((prev: FriendProps[]) => {
          const newFriendReqList = [...prev, ...res.data];
          setPageStateCache<ProfileSubroutesCache>(location, {
            ...getProfileSubroutesCache(location),
            friendRequests: { data: newFriendReqList, page: friendRequestPage },
          });
          return newFriendReqList;
        });
        setFriendRequestPage(friendRequestPage + 1);
        if (res.data.length === 0) {
          setNoMoreData(true);
        }
        setLoadingFriendRequests(false);
      })
      .catch((error) => setErrorMessage(error.response.data.message))
      .finally(
        () => { setAdditionalFriendRequest(false); setLoadingFriendRequests(false); },
      );
  }, [friendRequestPage, location]);

  useEffect(() => {
    if (additionalFriendRequest && !loadingFriendRequests) {
      if (!hasPageStateCache(location)
        || friendsReqList.length >= getProfileSubroutesCache(location).friendRequests?.data?.length
        || friendsReqList.length === 0
      ) {
        setTimeout(() => {
          setLoadingFriendRequests(true);
          fetchMoreFriendReqList();
        }, 0);
      }
    }
  }, [additionalFriendRequest, loadingFriendRequests, fetchMoreFriendReqList, friendsReqList.length,
    location.pathname, location]);
  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        friendsReqList.length === 0
          ? 'No friend requests at the moment.'
          : 'No more friend requests.'
      }
    </p>
  );
  const handleAcceptRequest = (userId: string) => {
    acceptFriendsRequest(userId)
      .then(() => {
        const acceptRequest = friendsReqList.filter((req: any) => req._id !== userId);
        setFriendsReqList(acceptRequest);
        dispatch(forceReloadSuggestedFriends());
      });
  };
  const handleRejectRequest = (userId: string) => {
    rejectFriendsRequest(userId)
      .then(() => {
        const removeRequest = friendsReqList.filter((req: any) => req._id !== userId);
        setFriendsReqList(removeRequest);
        dispatch(forceReloadSuggestedFriends());
      });
  };

  const persistScrollPosition = () => {
    setPageStateCache<ProfileSubroutesCache>(location, {
      ...getProfileSubroutesCache(location),
      friendRequests: { data: friendsReqList, page: friendRequestPage },
    });
  };
  const deleteAllFriendsSubrouteCache = (e: any, pathname?: string) => {
    if (pathname) {
      if (pathname.endsWith('/')) {
        // eslint-disable-next-line no-param-reassign
        pathname = pathname.slice(0, -1);
        // With above statement we fix issue of creating duplicate pathname keys with trailing `/`
      }
      setPageStateCache<ProfileSubroutesCache>(pathname, {
        ...getProfileSubroutesCache(pathname),
        // Note: We clear the cache for the target subroute only
        // so we always fetch fresh for target subroute.
        allFriends: PROFILE_SUBROUTES_DEFAULT_CACHE.allFriends,
      });
    }
  };
  const showAllFriendsAndFriendRequestsTabs = loginUserName === params.userName;
  return (
    <div>
      <ProfileHeader tabKey="friends" user={user} />
      <ProfileTabContent>
        <div className="mt-3">
          <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-3 pb-md-1 my-3 ">
            { showAllFriendsAndFriendRequestsTabs && (
              <TabLinks tabsClass="start" tabsClassSmall="center" tabLink={friendsTabs} toLink={`/${params.userName}/friends`} selectedTab="request" overrideOnClick={deleteAllFriendsSubrouteCache} />
            )}
            <InfiniteScroll
              threshold={3000}
              pageStart={0}
              initialLoad
              loadMore={() => setAdditionalFriendRequest(true)}
              hasMore={!noMoreData}
            >
              <Row className="mt-4" ref={friendRequestContainerElementRef}>
                {friendsReqList.map((friend: FriendProps) => (
                  <Col md={4} lg={6} xl={4} key={friend._id}>
                    <FriendsProfileCard
                      friend={friend}
                      friendsType="requested"
                      onAcceptClick={handleAcceptRequest}
                      onRejectClick={handleRejectRequest}
                      onSelect={persistScrollPosition}
                    />
                  </Col>
                ))}
              </Row>
            </InfiniteScroll>
            {loadingFriendRequests && <LoadingIndicator />}
            {noMoreData && renderNoMoreDataMessage()}
            <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
          </div>
        </div>
      </ProfileTabContent>
    </div>
  );
}

export default ProfileFriendRequest;
