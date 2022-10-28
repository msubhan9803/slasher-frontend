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
import { User } from '../../../types';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';

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
  const [search, setSearch] = useState<string>('');
  const [show, setShow] = useState(false);
  const [friendsList, setFriendsList] = useState<FriendProps[]>([]);
  const [friendCount, setFriendCount] = useState<number>();
  const [dropDownValue, setDropDownValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [page, setPage] = useState<number>(0);
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
    userProfileFriends(user.id, search ? 0 : page, search)
      .then((res) => {
        setFriendsList(res.data.friends);
        setFriendCount(res.data.allFriendCount);
        if (search) {
          setPage(0);
        } else {
          setPage(page + 1);
        }
      })
      .catch((error) => setErrorMessage(error.response.data.message));
  }, [search]);

  const fetchMoreFriendList = () => {
    if (!noMoreData) {
      userProfileFriends(user.id, page, search)
        .then((res) => {
          setFriendsList((prev: any) => [
            ...prev,
            ...res.data.friends,
          ]);
          setPage(page + 1);
          if (res.data.friends.length === 0) {
            setMoreData(true);
          }
        });
    }
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-other-user">
      <ProfileHeader tabKey="friends" user={user} />
      <div className="mt-2">
        <div className="d-md-flex d-block justify-content-between">
          <div>
            <CustomSearchInput label="Search friends..." setSearch={setSearch} search={search} />
          </div>
          <div className="d-flex align-self-center mt-3 mt-md-0">
            {
              friendCount
              && (
                <p className="fs-3 text-primary me-3 my-auto">
                  {friendCount}
                  {' '}
                  friends
                </p>
              )
            }
          </div>
        </div>
        {
          friendsList.length > 0
          && (
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
        }
        {
          friendsList.length === 0 && noMoreData
          && (
            <p className="mt-3">
              No friends at the moment.  Try sending or accepting some friend requests!
            </p>
          )
        }
        {
          friendsList.length === 0 && !noMoreData
          && (
            <LoadingIndicator />
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
