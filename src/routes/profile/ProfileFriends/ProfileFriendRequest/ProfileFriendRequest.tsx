import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';
import { useNavigate, useParams } from 'react-router-dom';
import { userProfileFriends, userProfileFriendsRequest } from '../../../../api/users';
import AuthenticatedPageWrapper from '../../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomSearchInput from '../../../../components/ui/CustomSearchInput';
import ErrorMessageList from '../../../../components/ui/ErrorMessageList';
import ReportModal from '../../../../components/ui/ReportModal';
import TabLinks from '../../../../components/ui/Tabs/TabLinks';
import ProfileHeader from '../../ProfileHeader';
import FriendsProfileCard from '../FriendsProfileCard';

function ProfileFriendRequest() {
  const navigate = useNavigate();
  const params = useParams();
  const [search, setSearch] = useState<string>('');
  const [show, setShow] = useState(false);
  const [userData, setUserData] = useState<any>();
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [friendOffsetData, setFriendOffsetData] = useState<number>(0);
  const [noMoreFriendData, setMoreData] = useState<boolean>(false);
  const [friendReqOffsetData, setFriendReqOffsetData] = useState<number>(0);
  const [noMoreFriendReqData, setMoreReqData] = useState<boolean>(false);
  const [friendsList, setFriendsList] = useState<any>([]);
  const [friendsReqList, setFriendsReqList] = useState<any>([]);
  const [dropDownValue, setDropDownValue] = useState('');
  const popoverOption = ['View profile', 'Message', 'Unfriend', 'Report', 'Block user'];
  const friendsTabs = [
    { value: 'all', label: 'All friends' },
    { value: 'friend-request', label: 'Friend requests', badge: friendsReqList.length },
  ];
  useEffect(() => {
    navigate(`/${params.userName}/friends/${friendsTabs[0].value}?view=self`);
  }, []);
  const handlePopoverOption = (value: string) => {
    if (value === 'Report' || value === 'Block user') {
      setShow(true);
      setDropDownValue(value);
    } else {
      navigate('/profile/friends/all?view=self');
    }
  };
  useEffect(() => {
    if (userData) {
      userProfileFriends(userData.id, friendOffsetData)
        .then((res) => { setFriendsList(res.data); setFriendOffsetData(friendOffsetData + 1); })
        .catch((error) => setErrorMessage(error.response.data.message));

      userProfileFriendsRequest(friendReqOffsetData)
        .then((res) => {
          setFriendsReqList(res.data);
          setFriendReqOffsetData(friendReqOffsetData + 1);
        })
        .catch((error) => setErrorMessage(error.response.data.message));
    }
  }, [userData]);
  const fetchMoreFriendList = () => {
    if (userData && !noMoreFriendData) {
      userProfileFriends(userData.id, friendOffsetData)
        .then((res) => {
          setFriendsList((prev: any) => [
            ...prev,
            ...res.data,
          ]);
          setFriendOffsetData(friendOffsetData + 1);
          if (res.data.length === 0) {
            setMoreData(true);
          }
        })
        .catch();
    }
  };
  const fetchMoreFriendReqList = () => {
    if (!noMoreFriendReqData) {
      userProfileFriendsRequest(friendReqOffsetData)
        .then((res) => {
          setFriendsReqList((prev: any) => [
            ...prev,
            ...res.data,
          ]);
          setFriendReqOffsetData(friendReqOffsetData + 1);
          if (res.data.length === 0) {
            setMoreReqData(true);
          }
        })
        .catch();
    }
  };

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <ProfileHeader tabKey="friends" userDetail={setUserData} />
      <div className="mt-3">
        <div className="d-sm-flex d-block justify-content-between">
          <div>
            <CustomSearchInput label="Search friends..." setSearch={setSearch} search={search} />
          </div>
          {params.id === 'all' && (
            <div className="d-none d-sm-flex align-self-center mt-3 mt-md-0">
              <p className="fs-3 text-primary me-3 my-auto">310 friends</p>
            </div>
          )}
        </div>
        <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-3 pb-md-1 my-3">
          <TabLinks tabsClass="start" tabsClassSmall="center" tabLink={friendsTabs} toLink={`/${params.userName}/friends`} selectedTab={params.id} params="?view=self" />
          {params.id === 'all' && (
            <div className="d-sm-none align-self-center mt-3 mt-md-0">
              <p className="fs-3 text-primary me-3 my-auto">310 friends</p>
            </div>
          )}
          {params.id === 'friend-request' ? (
            <InfiniteScroll
              pageStart={0}
              initialLoad={false}
              loadMore={fetchMoreFriendReqList}
              hasMore
            >
              <Row className="mt-4">
                {friendsReqList.map((friend: any) => (
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
          ) : (
            <InfiniteScroll
              pageStart={0}
              initialLoad={false}
              loadMore={fetchMoreFriendList}
              hasMore
            >
              <Row className="mt-4">
                {friendsList.map((friend: any) => (
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
          )}
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

export default ProfileFriendRequest;
