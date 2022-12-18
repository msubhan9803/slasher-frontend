import React, { useEffect, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { userProfileFriends } from '../../../api/users';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomSearchInput from '../../../components/ui/CustomSearchInput';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import ReportModal from '../../../components/ui/ReportModal';
import TabLinks from '../../../components/ui/Tabs/TabLinks';
import { User } from '../../../types';
import ProfileHeader from '../ProfileHeader';
import FriendsProfileCard from './FriendsProfileCard';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import { useAppSelector } from '../../../redux/hooks';

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
  const popoverOption = ['View profile', 'Message', 'Unfriend', 'Report', 'Block user'];
  const loginUserName = Cookies.get('userName');
  const friendsReqCount = useAppSelector((state) => state.user.friendRequestCount);
  const friendContainerElementRef = useRef<any>(null);
  const [yPositionOfLastFriendElement, setYPositionOfLastFriendElement] = useState<number>(0);

  const friendsTabs = [
    { value: '', label: 'All friends' },
    { value: 'request', label: 'Friend requests', badge: friendsReqCount },
  ];

  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    if (value === 'Report' || value === 'Block user') {
      setShow(true);
      setDropDownValue(value);
    } else if (value === 'View profile') {
      navigate(`/${popoverClickProps.userName}/about`);
    }
  };

  useEffect(() => {
    userProfileFriends(user.id, search ? 0 : page, search)
      .then((res) => {
        setFriendsList(res.data.friends);
        setFriendCount(res.data.allFriendCount);
        if (search) {
          setPage(0);
        } else {
          setPage(page + 1);
        }
        if (res.data.friends.length === 0) {
          setNoMoreData(true);
        }
      })
      .catch((error) => setErrorMessage(error.response.data.message));
  }, [search]);

  const fetchMoreFriendList = () => {
    if (page > 0) {
      userProfileFriends(user.id, page, search)
        .then((res) => {
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
    const bottomLine = window.scrollY + window.innerHeight > yPositionOfLastFriendElement;
    if (bottomLine) {
      fetchMoreFriendList();
    }
  }, [yPositionOfLastFriendElement]);

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        friendsList.length === 0
          ? 'No friends at the moment. Try sending or accepting some friend requests!'
          : 'No more friends'
      }
    </p>
  );

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <ProfileHeader tabKey="friends" user={user} />
      <div className="mt-3">
        <div className="d-sm-flex d-block justify-content-between">
          <div>
            <CustomSearchInput label="Search friends..." setSearch={setSearch} search={search} />
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
          {loginUserName === user.userName
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
          {noMoreData && renderNoMoreDataMessage()}
          {errorMessage && errorMessage.length > 0 && (
            <div className="mt-3 text-start">
              <ErrorMessageList errorMessages={errorMessage} className="m-0" />
            </div>
          )}
        </div>
      </div>
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}

export default ProfileFriends;
