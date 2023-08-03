/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { Col, Row } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';
import {
  useLocation, useNavigate, useParams,
} from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { userProfileFriends } from '../../../api/users';
import CustomSearchInput from '../../../components/ui/CustomSearchInput';
import ReportModal from '../../../components/ui/ReportModal';
import TabLinks from '../../../components/ui/Tabs/TabLinks';
import { ProfileSubroutesCache, User } from '../../../types';
import ProfileHeader from '../ProfileHeader';
import FriendsProfileCard from './FriendsProfileCard';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { reportData } from '../../../api/report';
import { createBlockUser } from '../../../api/blocks';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import { rejectFriendsRequest } from '../../../api/friends';
import ProfileTabContent from '../../../components/ui/profile/ProfileTabContent';
import { setPageStateCache } from '../../../pageStateCache';
import { PROFILE_SUBROUTES_DEFAULT_CACHE, getProfileSubroutesCache } from '../profileSubRoutesCacheUtils';
import { formatNumberWithUnits } from '../../../utils/number.utils';
import { setProfilePageUserDetailsReload } from '../../../redux/slices/userSlice';
import useProgressButton from '../../../components/ui/ProgressButton';

type UserProfileFriendsResponseData = AxiosResponse<{ friends: FriendProps[] }>;

interface FriendProps {
  _id?: string;
  id: string;
  firstName?: string;
  userName: string;
  profilePic: string;
}
interface Props {
  user: User;
  isSelfProfile: boolean;
}
function ProfileFriends({ user, isSelfProfile }: Props) {
  const navigate = useNavigate();
  const params = useParams();
  const [show, setShow] = useState(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [friendCount, setFriendCount] = useState<number>();
  const [dropDownValue, setDropDownValue] = useState('');
  const [loadingFriends, setLoadingFriends] = useState<boolean>(false);
  const [friendRemoveId, setFriendRemoveId] = useState<string>('');
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const popoverOption = isSelfProfile
    ? ['View profile', 'Message', 'Unfriend', 'Report', 'Block user']
    : ['View profile', 'Report', 'Block user'];
  const friendsReqCount = useAppSelector((state) => state.user.user.newFriendRequestCount);
  const loginUserName = useAppSelector((state) => state.user.user.userName);
  const [popoverClick, setPopoverClick] = useState<PopoverClickProps>();
  const [requestAdditionalFriends, setRequestAdditionalFriends] = useState<boolean>(false);
  const location = useLocation();
  const profileSubRoutesCache = getProfileSubroutesCache(location);
  const [friendsList, setFriendsList] = useState<FriendProps[]>(
    profileSubRoutesCache?.allFriends?.data || [],
  );
  const [page, setPage] = useState<number>(
    profileSubRoutesCache?.allFriends?.page || 0,
  );
  const [search, setSearch] = useState<string>(
    profileSubRoutesCache?.allFriends?.searchValue || '',
  );
  const controllerRef = useRef<AbortController | null>();
  const lastUserIdRef = useRef(user._id);
  const [initialLoad] = useState((profileSubRoutesCache.allFriends?.data.length || 0) === 0);
  const dispatch = useAppDispatch();

  const friendsTabs = [
    { value: '', label: 'All friends' },
    { value: 'request', label: 'Friend requests', badge: friendsReqCount },
  ];
  const onRemoveFriendClick = () => {
    rejectFriendsRequest(friendRemoveId).then(() => {
      // eslint-disable-next-line max-len
      setFriendsList((prevFriendsList) => prevFriendsList.filter((friend) => friend._id !== friendRemoveId));
      dispatch(setProfilePageUserDetailsReload(true));
      setShow(false);
    });
  };

  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    if (value === 'Report' || value === 'Block user') {
      setShow(true);
      setDropDownValue(value);
      setPopoverClick(popoverClickProps);
    } else if (value === 'View profile') {
      navigate(`/${popoverClickProps.userName}`);
    } else if (value === 'Unfriend') {
      if (popoverClickProps?.id) {
        setShow(true);
        setDropDownValue('Remove friend');
        setFriendRemoveId(popoverClickProps?.id);
      }
    } else if (value === 'Message') {
      navigate(`/app/messages/conversation/new?userId=${popoverClickProps?.userId}`);
    }
    setPopoverClick(popoverClickProps);
  };

  const fetchMoreFriendList = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    } else {
      const controller = new AbortController();
      controllerRef.current = controller;
      let searchUser = search;
      while (searchUser.startsWith('@')) {
        searchUser = searchUser.substring(1);
      }

      userProfileFriends(controllerRef.current?.signal, user._id, page, searchUser)
        .then((res: UserProfileFriendsResponseData) => {
          setFriendsList((prev) => {
            const newFriendsList = (page === 0 && search !== '') ? res.data.friends : [
              ...prev,
              ...res.data.friends,
            ];
            setPageStateCache<ProfileSubroutesCache>(location, {
              ...getProfileSubroutesCache(location),
              allFriends: { data: newFriendsList, page, searchValue: searchUser },
            });
            return newFriendsList;
          });
          setPage(page + 1);
          if (res.data.friends.length === 0) {
            setNoMoreData(true);
          }
        })
        .catch((error) => setErrorMessage(error.response.data.message))
        .finally(
          // eslint-disable-next-line max-len
          () => { setRequestAdditionalFriends(false); setLoadingFriends(false); controllerRef.current = null; },
        );
    }
  }, [location, page, search, user._id]);

  useEffect(() => {
    const isUserChanged = lastUserIdRef.current !== user._id;
    if (isUserChanged) {
      lastUserIdRef.current = user._id;
      // Cancel setting state for most recent friendList api call
      if (controllerRef.current) { controllerRef.current.abort(); }
      // TODO: Incorporate below logic into `fetchMoreFriendList(true)` where `true` would mean
      // TODO:      `forceReload` for friends and update below values there in the same function.
      // Set the new user's data in comoponent state
      setFriendsList(getProfileSubroutesCache(location)?.allFriends?.data || []);
      const currentPage = getProfileSubroutesCache(location)?.allFriends?.page || 0;
      setPage(currentPage);
      const currentSearch = getProfileSubroutesCache(location)?.allFriends?.searchValue || '';
      setSearch(currentSearch);
      // Reset infinite-loading
      setNoMoreData(false);
      setRequestAdditionalFriends(true);
    }

    if (requestAdditionalFriends && !loadingFriends && user._id) {
      setTimeout(() => {
        setLoadingFriends(true);
        fetchMoreFriendList();
      }, 200);
    }
  }, [requestAdditionalFriends, loadingFriends, search, friendsList, user._id, page,
    fetchMoreFriendList,
    location]);

  const renderNoMoreDataMessage = () => {
    const message = friendsList.length === 0 && search
      ? 'No results found'
      : 'No friends at the moment. Try sending or accepting some friend requests!';
    return (
      <p className="text-center m-0 py-3">
        {
          friendsList.length === 0
            ? message
            : 'No more friends'
        }
      </p>
    );
  };

  const handleSearch = (value: string) => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    setFriendsList([]);
    setNoMoreData(false);
    setRequestAdditionalFriends(true);
    setSearch(value);
    setPage(0);
  };
  const reportProfileFriend = (reason: string) => {
    setProgressButtonStatus('loading');
    const reportPayload = {
      targetId: popoverClick?.id,
      reason,
      reportType: 'profile',
    };
    reportData(reportPayload).then(() => {
      // setShow(false);
      setProgressButtonStatus('success');
    })
      /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
    setDropDownValue('PostReportSuccessDialog');
  };
  const afterBlockUser = () => {
    setShow(false);
  };
  const onBlockYesClick = () => {
    setProgressButtonStatus('loading');
    createBlockUser(popoverClick?.id!)
      .then((res) => {
        setDropDownValue('BlockUserSuccess');
        // setShow(false);
        if (res) {
          const updateFriendsList = friendsList.filter(
            (friend: any) => friend._id !== popoverClick?.id,
          );
          setProgressButtonStatus('success');
          setFriendsList(updateFriendsList);
          setFriendCount(friendCount ? friendCount - 1 : 0);
        }
      })
      /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
  };
  const persistScrollPosition = () => {
    setPageStateCache<ProfileSubroutesCache>(location, {
      ...getProfileSubroutesCache(location),
      allFriends: { data: friendsList, page, searchValue: search },
    });
  };

  const deleteFriendRequestsSubrouteCache = (e: any, pathname?: string) => {
    if (pathname) {
      if (pathname.endsWith('/')) {
        // eslint-disable-next-line no-param-reassign
        pathname = pathname.slice(0, -1);
        // With above statement we fix issue of creating duplicate pathname keys with trailing `/`
      }
      console.log('deleteFriendRequestsSubrouteCache:', pathname);
      setPageStateCache<ProfileSubroutesCache>(pathname, {
        ...getProfileSubroutesCache(pathname),
        // Note: We clear the cache for the target subroute only
        // so we always fetch fresh for target subroute.
        friendRequests: PROFILE_SUBROUTES_DEFAULT_CACHE.friendRequests,
      });
    }
  };
  const showAllFriendsAndFriendRequestsTabs = loginUserName === params.userName;
  const friendsCountWithLabel = `Friends: ${formatNumberWithUnits(user.friendsCount)}`;
  return (
    <div>
      <ProfileHeader tabKey="friends" user={user} />
      <ProfileTabContent>
        <div className="mt-3">
          <Row className="justify-content-between">
            <Col md={4}>
              <CustomSearchInput label="Search friends..." setSearch={handleSearch} search={search} />
            </Col>
          </Row>
          <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-3 my-3 py-3">
            {showAllFriendsAndFriendRequestsTabs && (
              <div>
                <div className="d-flex justify-content-between">
                  <TabLinks tabsClass="start" tabsClassSmall="center" tabLink={friendsTabs} toLink={`/${params.userName}/friends`} selectedTab="" overrideOnClick={deleteFriendRequestsSubrouteCache} />
                  {/* Desktop friends count view (self profile) */}
                  <div className="fw-bold text-end d-none d-sm-block my-auto">{friendsCountWithLabel}</div>
                </div>
                {/* Mobile friends count view (self profile) */}
                <div className="ms-3 fw-bold text-start mt-4 d-sm-none">{friendsCountWithLabel}</div>
              </div>
            )}

            {!isSelfProfile && (
              <>
                {/* Desktop friends count view (other user profile) */}
                <div className="fw-bold text-end d-none d-sm-block">{friendsCountWithLabel}</div>
                {/* Mobile friends count view (other user profile) */}
                <div className="ms-3 fw-bold text-start d-sm-none">{friendsCountWithLabel}</div>
              </>
            )}

            <InfiniteScroll
              threshold={3000}
              pageStart={0}
              initialLoad={initialLoad}
              loadMore={() => { setRequestAdditionalFriends(true); }}
              hasMore={!noMoreData}
            /* NOTE: Do not use a custom parentNode element as it leads to infinte loading.
            of friends for some unknown reason. */
            >
              <Row className="mt-4">
                {friendsList.map((friend: FriendProps) => (
                  <Col md={4} lg={6} xl={4} key={friend._id}>
                    <FriendsProfileCard
                      friend={friend}
                      popoverOption={popoverOption}
                      handlePopoverOption={handlePopoverOption}
                      onSelect={persistScrollPosition}
                    />
                  </Col>
                ))}
              </Row>
            </InfiniteScroll>
            {loadingFriends && <LoadingIndicator className="py-3" />}
            {noMoreData && renderNoMoreDataMessage()}
            <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
          </div>
        </div>
        <ReportModal
          show={show}
          setShow={setShow}
          slectedDropdownValue={dropDownValue}
          handleReport={reportProfileFriend}
          onBlockYesClick={onBlockYesClick}
          afterBlockUser={afterBlockUser}
          onConfirmClick={onRemoveFriendClick}
          ProgressButton={ProgressButton}
        />
      </ProfileTabContent>
    </div>
  );
}

export default ProfileFriends;
