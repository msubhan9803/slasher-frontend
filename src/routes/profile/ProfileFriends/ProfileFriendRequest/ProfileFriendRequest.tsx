import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';
import { useNavigate, useParams } from 'react-router-dom';
import { userProfileFriendsRequest } from '../../../../api/friends';
import AuthenticatedPageWrapper from '../../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomSearchInput from '../../../../components/ui/CustomSearchInput';
import ErrorMessageList from '../../../../components/ui/ErrorMessageList';
import TabLinks from '../../../../components/ui/Tabs/TabLinks';
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
  const params = useParams();
  const [search, setSearch] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [friendRequestPage, setFriendRequestPage] = useState<number>(0);
  const [noMoreFriendReqData, setMoreReqData] = useState<boolean>(false);
  const [friendsReqList, setFriendsReqList] = useState<FriendProps[]>([]);
  const loginUserName = Cookies.get('userName');

  const friendsTabs = [
    { value: '', label: 'All friends' },
    { value: 'request', label: 'Friend requests', badge: friendsReqList.length },
  ];

  useEffect(() => {
    if (loginUserName === user.userName) {
      navigate(`/${params.userName}/friends/request`);
    } else {
      navigate(`/${params.userName}/friends`);
    }
  }, []);

  useEffect(() => {
    userProfileFriendsRequest(friendRequestPage)
      .then((res) => {
        setFriendsReqList(res.data);
        setFriendRequestPage(friendRequestPage + 1);
      })
      .catch((error) => setErrorMessage(error.response.data.message));
  }, []);
  const fetchMoreFriendReqList = () => {
    if (!noMoreFriendReqData) {
      userProfileFriendsRequest(friendRequestPage)
        .then((res) => {
          setFriendsReqList((prev: FriendProps[]) => [
            ...prev,
            ...res.data,
          ]);
          setFriendRequestPage(friendRequestPage + 1);
          if (res.data.length === 0) {
            setMoreReqData(true);
          }
        })
        .catch();
    }
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
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
            loadMore={fetchMoreFriendReqList}
            hasMore
          >
            <Row className="mt-4">
              {friendsReqList.map((friend: FriendProps) => (
                /* eslint no-underscore-dangle: 0 */
                <Col md={4} lg={6} xl={4} key={friend._id}>
                  <FriendsProfileCard
                    friend={friend}
                    friendsType="requested"
                  />
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
          {errorMessage && errorMessage.length > 0 && (
            <div className="mt-3 text-start">
              <ErrorMessageList errorMessages={errorMessage} className="m-0" />
            </div>
          )}
        </div>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default ProfileFriendRequest;
