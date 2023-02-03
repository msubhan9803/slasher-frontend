import Cookies from 'js-cookie';
import React, { useEffect, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';
import { useNavigate, useParams } from 'react-router-dom';
import { acceptFriendsRequest, rejectFriendsRequest, userProfileFriendsRequest } from '../../../../api/friends';
import { userInitialData } from '../../../../api/users';
import CustomSearchInput from '../../../../components/ui/CustomSearchInput';
import ErrorMessageList from '../../../../components/ui/ErrorMessageList';
import LoadingIndicator from '../../../../components/ui/LoadingIndicator';
import TabLinks from '../../../../components/ui/Tabs/TabLinks';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { setUserInitialData } from '../../../../redux/slices/userSlice';
import { User } from '../../../../types';
import ProfileHeader from '../../ProfileHeader';
import FriendsProfileCard from '../FriendsProfileCard';

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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const params = useParams();
  const [search, setSearch] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [friendRequestPage, setFriendRequestPage] = useState<number>(0);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [friendsReqList, setFriendsReqList] = useState<FriendProps[]>([]);
  const loginUserName = Cookies.get('userName');
  const friendsReqCount = useAppSelector((state) => state.user.friendRequestCount);
  const friendRequestContainerElementRef = useRef<any>(null);
  const [yPositionOfLastFriendElement, setYPositionOfLastFriendElement] = useState<number>(0);
  const [loadingFriendRequests, setLoadingFriendRequests] = useState<boolean>(false);
  const [additionalFriendRequest, setAdditionalFriendRequest] = useState<boolean>(false);

  const friendsTabs = [
    { value: '', label: 'All friends' },
    { value: 'request', label: 'Friend requests', badge: friendsReqCount },
  ];

  const fetchMoreFriendReqList = () => {
    userProfileFriendsRequest(friendRequestPage)
      .then((res) => {
        setFriendsReqList((prev: FriendProps[]) => [
          ...prev,
          ...res.data,
        ]);
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
  };
  useEffect(() => {
    if (additionalFriendRequest && !loadingFriendRequests) {
      setLoadingFriendRequests(true);
      fetchMoreFriendReqList();
    }
  }, [additionalFriendRequest, loadingFriendRequests]);
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
        userProfileFriendsRequest(0)
          .then((res) => setFriendsReqList(res.data));
        userInitialData().then((res) => {
          dispatch(setUserInitialData(res.data));
        });
      });
  };
  const handleRejectRequest = (userId: string) => {
    rejectFriendsRequest(userId)
      .then(() => {
        userProfileFriendsRequest(0)
          .then((res) => setFriendsReqList(res.data));
        userInitialData().then((res) => {
          dispatch(setUserInitialData(res.data));
        });
      });
  };
  const getYPosition = () => {
    const yPosition = friendRequestContainerElementRef.current?.lastElementChild?.offsetTop;
    setYPositionOfLastFriendElement(yPosition);
  };
  useEffect(() => {
    if (loginUserName === user.userName) {
      navigate(`/${params.userName}/friends/request`);
    } else {
      navigate(`/${params.userName}/friends`);
    }
    getYPosition();
  }, [friendsReqList]);

  useEffect(() => {
    if (yPositionOfLastFriendElement) {
      const bottomLine = window.scrollY + window.innerHeight > yPositionOfLastFriendElement;
      if (bottomLine && noMoreData && friendRequestPage > 0) {
        fetchMoreFriendReqList();
      }
    }
  }, [yPositionOfLastFriendElement]);
  return (
    <div>
      <ProfileHeader tabKey="friends" user={user} />
      <div className="mt-3">
        <div className="d-sm-flex d-block justify-content-between">
          <div>
            <CustomSearchInput label="Search friends..." setSearch={setSearch} search={search} />
          </div>
        </div>
        <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-3 pb-md-1 my-3">
          {loginUserName === user.userName
            && <TabLinks tabsClass="start" tabsClassSmall="center" tabLink={friendsTabs} toLink={`/${params.userName}/friends`} selectedTab="request" />}
          <InfiniteScroll
            pageStart={0}
            initialLoad={false}
            loadMore={() => { setAdditionalFriendRequest(true); }}
            hasMore={!noMoreData}
          >
            <Row className="mt-4" ref={friendRequestContainerElementRef}>
              {friendsReqList.map((friend: FriendProps) => (
                /* eslint no-underscore-dangle: 0 */
                <Col md={4} lg={6} xl={4} key={friend._id}>
                  <FriendsProfileCard
                    friend={friend}
                    friendsType="requested"
                    onAcceptClick={handleAcceptRequest}
                    onRejectClick={handleRejectRequest}
                  />
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
          {loadingFriendRequests && <LoadingIndicator />}
          {noMoreData && renderNoMoreDataMessage()}
          {errorMessage && errorMessage.length > 0 && (
            <div className="mt-3 text-start">
              <ErrorMessageList errorMessages={errorMessage} className="m-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileFriendRequest;
