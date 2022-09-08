import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomSearchInput from '../../../../components/ui/CustomSearchInput';
import ReportModal from '../../../../components/ui/ReportModal';
import TabLinks from '../../../../components/ui/Tabs/TabLinks';
import ProfileHeader from '../../ProfileHeader';
import { friendList, friendRequestList } from '../friends-data';
import FriendsProfileCard from '../FriendsProfileCard';

function ProfileFriendRequest() {
  const navigate = useNavigate();
  const params = useParams();
  const [search, setSearch] = useState<string>('');
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const popoverOption = ['View profile', 'Message', 'Unfriend', 'Report', 'Block user'];
  const friendsTabs = [
    { value: 'all', label: 'All friends' },
    { value: 'friend-request', label: 'Friend requests', badge: friendRequestList.length },
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
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <ProfileHeader tabKey="friends" />
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
          <TabLinks tabsClass="start" tabsClassSmall="center" tabLink={friendsTabs} toLink="/profile/friends" selectedTab={params.id} params="?view=self" />
          {params.id === 'all' && (
            <div className="d-sm-none align-self-center mt-3 mt-md-0">
              <p className="fs-3 text-primary me-3 my-auto">310 friends</p>
            </div>
          )}
          {params.id === 'friend-request' ? (
            <Row className="mt-4">
              {friendRequestList.map((friend: any) => (
                <Col sm={6} lg={12} xl={6} key={friend.id}>
                  <FriendsProfileCard
                    friend={friend}
                    popoverOption={popoverOption}
                    handlePopoverOption={handlePopoverOption}
                    friendsType="requested"
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <Row className="mt-4">
              {friendList.map((friend: any) => (
                <Col md={4} lg={6} xl={4} key={friend.id}>
                  <FriendsProfileCard
                    friend={friend}
                    popoverOption={popoverOption}
                    handlePopoverOption={handlePopoverOption}
                    friendsType="my-friends"
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}

export default ProfileFriendRequest;
