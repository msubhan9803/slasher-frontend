/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { Col, Row } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';
import {
  useLocation, useNavigate, useParams,
} from 'react-router-dom';
import { userProfileFriends } from '../../../api/users';
import CustomSearchInput from '../../../components/ui/CustomSearchInput';
import ReportModal from '../../../components/ui/ReportModal';
import TabLinks from '../../../components/ui/Tabs/TabLinks';
import { User } from '../../../types';
import ProfileHeader from '../ProfileHeader';
import FriendsProfileCard from './FriendsProfileCard';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import { useAppSelector } from '../../../redux/hooks';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { reportData } from '../../../api/report';
import { createBlockUser } from '../../../api/blocks';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import { rejectFriendsRequest } from '../../../api/friends';
import ProfileTabContent from '../../../components/ui/profile/ProfileTabContent';
import {
  deletePageStateCache, getPageStateCache, hasPageStateCache, setPageStateCache,
} from '../../../pageStateCache';

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
  const popoverOption = isSelfProfile
    ? ['View profile', 'Message', 'Unfriend', 'Report', 'Block user']
    : ['View profile', 'Report', 'Block user'];
  const friendsReqCount = useAppSelector((state) => state.user.user.newFriendRequestCount);
  const friendContainerElementRef = useRef<any>(null);
  const loginUserData = useAppSelector((state) => state.user.user);
  const [popoverClick, setPopoverClick] = useState<PopoverClickProps>();
  const [additionalFriend, setAdditionalFriend] = useState<boolean>(false);
  const location = useLocation();
  const [userId, setUserId] = useState('');
  type CacheType = { page: number, data: any[], searchValue: string };
  const pageStateCache: CacheType = getPageStateCache(location) ?? { page: 0, data: [], searchValue: '' };
  const [friendsList, setFriendsList] = useState<FriendProps[]>(
    hasPageStateCache(location)
      ? pageStateCache?.data : [],
  );
  const [page, setPage] = useState<number>(
    hasPageStateCache(location)
      ? pageStateCache?.page : 0,
  );
  const [search, setSearch] = useState<string>(
    hasPageStateCache(location)
      ? pageStateCache?.searchValue : '',
  );
  const isLoadingRef = useRef(true);
  const controllerRef = useRef<AbortController | null>();

  const friendsTabs = [
    { value: '', label: 'All friends' },
    { value: 'request', label: 'Friend requests', badge: friendsReqCount },
  ];

  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    if (value === 'Report' || value === 'Block user') {
      setShow(true);
      setDropDownValue(value);
      setPopoverClick(popoverClickProps);
    } else if (value === 'View profile') {
      navigate(`/${popoverClickProps.userName}`);
    } else if (value === 'Unfriend') {
      if (popoverClickProps?.id) {
        rejectFriendsRequest(popoverClickProps?.id!).then(() => {
          // eslint-disable-next-line max-len
          setFriendsList((prevFriendsList) => prevFriendsList.filter((friend) => friend._id !== popoverClickProps?.id));
        });
      }
    } else if (value === 'Message') {
      navigate(`/app/messages/conversation/new?userId=${popoverClickProps?.userId}`);
    }
    setPopoverClick(popoverClickProps);
  };

  useEffect(() => {
    if (user.userName === params.userName) {
      setUserId(user._id);
      setNoMoreData(false);
      setAdditionalFriend(true);
    }
  }, [params.userName, user.userName, user._id, location.pathname]);

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
      userProfileFriends(controllerRef.current?.signal, userId, page, searchUser)
        .then((res) => {
          setFriendsList((prev: any) => (page === 0 && search !== ''
            ? res.data.friends
            : [
              ...prev,
              ...res.data.friends,
            ]
          ));
          setPage(page + 1);
          if (res.data.friends.length === 0) {
            setNoMoreData(true);
          }
          if (hasPageStateCache(location)) { deletePageStateCache(location); }
        })
        .catch((error) => setErrorMessage(error.response.data.message))
        .finally(
          // eslint-disable-next-line max-len
          () => { setAdditionalFriend(false); setLoadingFriends(false); isLoadingRef.current = false; controllerRef.current = null; },
        );
    }
  }, [search, userId, page, location]);

  useEffect(() => {
    if (additionalFriend && !loadingFriends && userId && user.userName === params.userName) {
      if (!hasPageStateCache(location)
        || friendsList.length >= pageStateCache.data.length
        || friendsList.length === 0
        || page > 0
      ) {
        setTimeout(() => {
          setLoadingFriends(true);
          fetchMoreFriendList();
        }, 0);
      }
    }
  }, [additionalFriend, loadingFriends, search, friendsList, userId, location.pathname,
    page, fetchMoreFriendList, user.userName, params.userName, location,
    pageStateCache.data.length]);

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
    setAdditionalFriend(true);
    setSearch(value);
    setPage(0);
  };
  const reportProfileFriend = (reason: string) => {
    const reportPayload = {
      targetId: popoverClick?.id,
      reason,
      reportType: 'profile',
    };
    reportData(reportPayload).then(() => {
      setShow(false);
    })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };
  const onBlockYesClick = () => {
    createBlockUser(popoverClick?.id!)
      .then((res) => {
        setShow(false);
        if (res.status === 201) {
          const updateFriendsList = friendsList.filter(
            (friend: any) => friend._id !== popoverClick?.id,
          );
          setFriendsList(updateFriendsList);
          setFriendCount(friendCount ? friendCount - 1 : 0);
        }
      })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };
  const persistScrollPosition = () => {
    setPageStateCache<CacheType>(location, { data: friendsList, page, searchValue: search });
  };
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
            {loginUserData.userName === user.userName
              && <TabLinks tabsClass="start" tabsClassSmall="center" tabLink={friendsTabs} toLink={`/${params.userName}/friends`} selectedTab="" />}
            <InfiniteScroll
              threshold={3000}
              pageStart={0}
              initialLoad
              loadMore={() => { setAdditionalFriend(true); }}
              hasMore={!noMoreData}
            >
              <Row ref={friendContainerElementRef} className="mt-4">
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
            {(isLoadingRef.current || loadingFriends) && <LoadingIndicator className="py-3" />}
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
        />
      </ProfileTabContent>
    </div>
  );
}

export default ProfileFriends;
