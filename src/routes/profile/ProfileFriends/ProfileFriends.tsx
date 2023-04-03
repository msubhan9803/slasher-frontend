/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { Col, Row } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { userProfileFriends } from '../../../api/users';
import CustomSearchInput from '../../../components/ui/CustomSearchInput';
import ReportModal from '../../../components/ui/ReportModal';
import TabLinks from '../../../components/ui/Tabs/TabLinks';
import { User } from '../../../types';
import ProfileHeader from '../ProfileHeader';
import FriendsProfileCard from './FriendsProfileCard';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { reportData } from '../../../api/report';
import { createBlockUser } from '../../../api/blocks';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import { setScrollPosition } from '../../../redux/slices/scrollPositionSlice';

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
function ProfileFriends({ user }: Props) {
  const navigate = useNavigate();
  const params = useParams();
  const [show, setShow] = useState(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [friendCount, setFriendCount] = useState<number>();
  const [dropDownValue, setDropDownValue] = useState('');
  const [loadingFriends, setLoadingFriends] = useState<boolean>(false);
  const popoverOption = ['View profile', 'Message', 'Unfriend', 'Report', 'Block user'];
  const friendsReqCount = useAppSelector((state) => state.user.friendRequestCount);
  const friendContainerElementRef = useRef<any>(null);
  const loginUserData = useAppSelector((state) => state.user.user);
  const [popoverClick, setPopoverClick] = useState<PopoverClickProps>();
  const [additionalFriend, setAdditionalFriend] = useState<boolean>(false);
  const scrollPosition: any = useAppSelector((state: any) => state.scrollPosition);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [userId, setUserId] = useState('');
  const [friendsList, setFriendsList] = useState<FriendProps[]>(
    scrollPosition.pathname === location.pathname
      ? scrollPosition?.data : [],
  );
  const [page, setPage] = useState<number>(
    scrollPosition.pathname === location.pathname
      ? scrollPosition?.page : 0,
  );
  const [search, setSearch] = useState<string>(
    scrollPosition.pathname === location.pathname
      ? scrollPosition?.searchValue : '',
  );

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
    }
    setPopoverClick(popoverClickProps);
  };

  useEffect(() => {
    if (user.userName === params.userName) {
      setUserId(user._id);
      setFriendsList(scrollPosition.pathname === location.pathname
        ? scrollPosition?.data : []);
      setNoMoreData(false);
      setSearch(scrollPosition.pathname === location.pathname
        ? scrollPosition?.searchValue : '');
      setAdditionalFriend(true);
      setPage(scrollPosition.pathname === location.pathname
        ? scrollPosition?.page : 0);
    }
  }, [params.userName, user.userName, user._id, scrollPosition, location.pathname]);

  const fetchMoreFriendList = useCallback(() => {
    let searchUser = search;
    while (searchUser.startsWith('@')) {
      searchUser = searchUser.substring(1);
    }
    userProfileFriends(userId, page, searchUser)
      .then((res) => {
        setFriendsList((prev: any) => (page === 0
          ? res.data.friends
          : [
            ...prev,
            ...res.data.friends,
          ]));
        setPage(page + 1);
        if (res.data.friends.length === 0) {
          setNoMoreData(true);
        }
        if (scrollPosition.pathname === location.pathname
          && friendsList.length >= scrollPosition.data.length + 10) {
          const positionData = {
            pathname: '',
            position: 0,
            data: [],
            positionElementId: '',
            page: 0,
            searchValue: '',
          };
          dispatch(setScrollPosition(positionData));
        }
      })
      .catch((error) => setErrorMessage(error.response.data.message))
      .finally(
        () => { setAdditionalFriend(false); setLoadingFriends(false); },
      );
  }, [search, userId, page, scrollPosition, dispatch, friendsList, location]);

  useEffect(() => {
    if (additionalFriend && !loadingFriends && userId && user.userName === params.userName) {
      if (scrollPosition === null
        || scrollPosition?.position === 0
        || friendsList.length >= scrollPosition?.data?.length
        || friendsList.length === 0
        || scrollPosition.pathname !== location.pathname
      ) {
        setTimeout(() => {
          setLoadingFriends(true);
          fetchMoreFriendList();
        }, 0);
      }
    }
  }, [additionalFriend, loadingFriends, search, friendsList, userId, location.pathname,
    page, fetchMoreFriendList, scrollPosition, user.userName, params.userName]);

  const renderNoMoreDataMessage = () => {
    const message = friendsList.length === 0 && search
      ? 'No results found'
      : 'No friends at the moment. Try sending or accepting some friend requests!';
    return (
      <p className="text-center">
        {
          friendsList.length === 0
            ? message
            : 'No more friends'
        }
      </p>
    );
  };

  const handleSearch = (value: string) => {
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
  const persistScrollPosition = (id: string) => {
    const positionData = {
      pathname: location.pathname,
      position: window.pageYOffset === 0 ? 1 : window.pageYOffset,
      data: friendsList,
      positionElementId: id,
      page,
      searchValue: search,
    };
    dispatch(setScrollPosition(positionData));
  };
  return (
    <div>
      <ProfileHeader tabKey="friends" user={user} />
      <div className="mt-3">
        <Row className="justify-content-between">
          <Col md={4}>
            <CustomSearchInput label="Search friends..." setSearch={handleSearch} search={search} />
          </Col>
          {/* <div className="d-flex align-self-center mt-3 mt-md-0">
      {
        friendCount
          ? (
            <p className="fs-3 text-primary me-3 my-auto">
              {friendCount}
              {' '}
              friends
            </p>
          )
          : ''
      } */}
          {/* </div> */}
        </Row>
        <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-3 pb-md-1 my-3">
          {loginUserData.userName === user.userName
            && <TabLinks tabsClass="start" tabsClassSmall="center" tabLink={friendsTabs} toLink={`/${params.userName}/friends`} selectedTab="" />}
          <InfiniteScroll
            threshold={3000}
            pageStart={0}
            initialLoad
            loadMore={() => { setAdditionalFriend(true); }}
            hasMore={!noMoreData}
          >
            <Row className="mt-4" ref={friendContainerElementRef}>
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
          {loadingFriends && <LoadingIndicator />}
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
    </div>
  );
}

export default ProfileFriends;
