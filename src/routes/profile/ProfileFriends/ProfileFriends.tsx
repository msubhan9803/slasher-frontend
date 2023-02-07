/* eslint-disable max-lines */
import React, { useEffect, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';
import { useNavigate, useParams } from 'react-router-dom';
import { userProfileFriends } from '../../../api/users';
import CustomSearchInput from '../../../components/ui/CustomSearchInput';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
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
  const [search, setSearch] = useState<string>('');
  const [show, setShow] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [friendCount, setFriendCount] = useState<number>();
  const [friendsList, setFriendsList] = useState<FriendProps[]>([]);
  const [dropDownValue, setDropDownValue] = useState('');
  const [loadingFriends, setLoadingFriends] = useState<boolean>(false);
  const popoverOption = ['View profile', 'Message', 'Unfriend', 'Report', 'Block user'];
  const friendsReqCount = useAppSelector((state) => state.user.friendRequestCount);
  const friendContainerElementRef = useRef<any>(null);
  const [yPositionOfLastFriendElement, setYPositionOfLastFriendElement] = useState<number>(0);
  const loginUserData = useAppSelector((state) => state.user.user);
  const [popoverClick, setPopoverClick] = useState<PopoverClickProps>();

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
    setNoMoreData(false);
    if (page === 0) setFriendsList([]);
    setLoadingFriends(true);
    /* eslint no-underscore-dangle: 0 */
    userProfileFriends(user._id, search ? 0 : page, search)
      .then((res) => {
        setFriendsList(res.data.friends);
        setFriendCount(res.data.allFriendCount);
        setPage(page + 1);
        setLoadingFriends(false);
        if (search) {
          setPage(0);
        } else {
          setPage(page + 1);
        }
        if (res.data.friends.length === 0) {
          setNoMoreData(true);
        }
      })
      .catch((error) => {
        setErrorMessage(error.response.data.message); setLoadingFriends(false);
      });
  }, [search, user]);

  const fetchMoreFriendList = () => {
    if (page > 0) {
      setLoadingFriends(true);
      userProfileFriends(user._id, page, search)
        .then((res) => {
          setLoadingFriends(false);
          setFriendsList((prev: any) => [
            ...prev,
            ...res.data.friends,
          ]);
          setPage(page + 1);
          if (res.data.friends.length === 0) {
            setNoMoreData(true);
          }
        });
    }
  };
  const getYPosition = () => {
    const yPosition = friendContainerElementRef.current?.lastElementChild?.offsetTop;
    setYPositionOfLastFriendElement(yPosition);
  };
  useEffect(() => {
    getYPosition();
  }, [friendsList]);

  useEffect(() => {
    if (yPositionOfLastFriendElement) {
      const bottomLine = window.scrollY + window.innerHeight > yPositionOfLastFriendElement;
      if (bottomLine) {
        if (search.length > 0) setPage(page === 0 ? page + 1 : 0);
        fetchMoreFriendList();
      }
    }
  }, [yPositionOfLastFriendElement]);

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
    let searchUser = value;
    if (searchUser.charAt(0) === '@') {
      searchUser = searchUser.slice(1);
    }
    if (value.length > 0) {
      setFriendsList([]);
    }
    setSearch(searchUser);
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
  return (
    <div>
      <ProfileHeader tabKey="friends" user={user} />
      <div className="mt-3">
        <div className="d-sm-flex d-block justify-content-between">
          <div>
            <CustomSearchInput label="Search friends..." setSearch={handleSearch} search={search} />
          </div>
          <div className="d-flex align-self-center mt-3 mt-md-0">
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
            }
          </div>
        </div>
        <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-3 pb-md-1 my-3">
          {loginUserData.userName === user.userName
            && <TabLinks tabsClass="start" tabsClassSmall="center" tabLink={friendsTabs} toLink={`/${params.userName}/friends`} selectedTab="" />}
          <InfiniteScroll
            pageStart={0}
            initialLoad={false}
            loadMore={fetchMoreFriendList}
            hasMore={!noMoreData}
          >
            <Row className="mt-4" ref={friendContainerElementRef}>
              {friendsList.map((friend: FriendProps) => (
                /* eslint no-underscore-dangle: 0 */
                <Col md={4} lg={6} xl={4} key={friend._id}>
                  <FriendsProfileCard
                    friend={friend}
                    popoverOption={popoverOption}
                    handlePopoverOption={handlePopoverOption}
                  />
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
          {loadingFriends && <LoadingIndicator />}
          {noMoreData && renderNoMoreDataMessage()}
          {errorMessage && errorMessage.length > 0 && (
            <div className="mt-3 text-start">
              <ErrorMessageList errorMessages={errorMessage} className="m-0" />
            </div>
          )}
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
