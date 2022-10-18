import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomSearchInput from '../../../components/ui/CustomSearchInput';
import ProfileHeader from '../ProfileHeader';
import ReportModal from '../../../components/ui/ReportModal';
import FriendsProfileCard from './FriendsProfileCard';
import { userProfileFriends } from '../../../api/users';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';

interface FriendProps {
  _id?: string;
  id: string;
  firstName?: string;
  userName: string;
  profilePic: string;
}

function ProfileFriends() {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>('');
  const [show, setShow] = useState(false);
  const [userData, setUserData] = useState<FriendProps>();
  const [friendsList, setFriendsList] = useState<FriendProps[]>([]);
  const [dropDownValue, setDropDownValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [offset, setOffset] = useState<number>(0);
  const [noMoreData, setMoreData] = useState<boolean>(false);

  const popoverOption = ['View profile', 'Report', 'Block user'];
  const handlePopoverOption = (value: string) => {
    if (value === 'View profile') {
      navigate('/profile/friends');
    } else {
      setShow(true);
      setDropDownValue(value);
    }
  };

  useEffect(() => {
    if (userData) {
      userProfileFriends(userData.id, offset)
        .then((res) => { setFriendsList(res.data); setOffset(offset + 1); })
        .catch((error) => setErrorMessage(error.response.data.message));
    }
  }, [userData]);

  const fetchMoreFriendList = () => {
    if (userData && !noMoreData) {
      userProfileFriends(userData.id, offset)
        .then((res) => {
          setFriendsList((prev: any) => [
            ...prev,
            ...res.data,
          ]);
          setOffset(offset + 1);
          if (res.data.length === 0) {
            setMoreData(true);
          }
        });
    }
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-other-user">
      <ProfileHeader tabKey="friends" userDetail={setUserData} />
      <div className="mt-2">
        <div className="d-md-flex d-block justify-content-between">
          <div>
            <CustomSearchInput label="Search friends..." setSearch={setSearch} search={search} />
          </div>
          <div className="d-flex align-self-center mt-3 mt-md-0">
            <p className="fs-3 text-primary me-3 my-auto">310 friends</p>
          </div>
        </div>
        {
          friendsList && friendsList.length > 0
            ? (
              <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-3 pb-md-1 my-3">
                <InfiniteScroll
                  pageStart={0}
                  initialLoad={false}
                  loadMore={fetchMoreFriendList}
                  hasMore
                >
                  <Row className="mt-2">
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
              </div>
            )
            : (
              <p className="mt-3">
                No friends at the moment.  Try sending or accepting some friend requests!
              </p>
            )
        }
        {errorMessage && errorMessage.length > 0 && (
          <div className="mt-3 text-start">
            <ErrorMessageList errorMessages={errorMessage} className="m-0" />
          </div>
        )}
      </div>
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}

export default ProfileFriends;
