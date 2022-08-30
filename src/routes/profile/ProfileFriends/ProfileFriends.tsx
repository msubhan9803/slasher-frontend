import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomSearchInput from '../../../components/ui/CustomSearchInput';
import ProfileHeader from '../ProfileHeader';
import FriendsProfileCard from './FriendsProfileCard';
import { friendList } from './friends-data';

function ProfileFriends() {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>('');
  const vieweOptions = ['View profile', 'Report', 'Block user'];
  const handleFriendsOption = (value: string) => {
    navigate(`/${value}`);
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-other-user">
      <ProfileHeader tabKey="friends" />
      <div className="mt-3">
        <div className="d-md-flex d-block justify-content-between">
          <div>
            <CustomSearchInput label="Search friends..." setSearch={setSearch} search={search} />
          </div>
          <div className="d-flex align-self-center mt-3 mt-md-0">
            <p className="fs-3 text-primary me-3 my-auto">310 friends</p>
          </div>
        </div>
        <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-3 pb-md-1 my-3">
          <Row className="mt-4">
            {friendList.map((friend: any) => (
              <Col md={4} lg={6} xl={4} key={friend.id}>
                <FriendsProfileCard
                  friend={friend}
                  popoverOption={vieweOptions}
                  handleFriendsOption={handleFriendsOption}
                />
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default ProfileFriends;
