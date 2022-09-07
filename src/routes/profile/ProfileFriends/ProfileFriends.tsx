import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomSearchInput from '../../../components/ui/CustomSearchInput';
import ProfileHeader from '../ProfileHeader';
import ReportModal from '../../../components/ui/ReportModal';
import { friendList } from './friends-data';
import FriendsProfileCard from './FriendsProfileCard';

function ProfileFriends() {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>('');
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const popoverOption = ['View profile', 'Report', 'Block user'];
  const handlePopoverOption = (value: string) => {
    if (value === 'View profile') {
      navigate('/profile/friends');
    } else {
      setShow(true);
      setDropDownValue(value);
    }
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-other-user">
      <ProfileHeader tabKey="friends" />
      <div className="mt-2">
        <div className="d-md-flex d-block justify-content-between">
          <div>
            <CustomSearchInput label="Search friends..." setSearch={setSearch} search={search} />
          </div>
          <div className="d-flex align-self-center mt-3 mt-md-0">
            <p className="fs-3 text-primary me-3 my-auto">310 friends</p>
          </div>
        </div>
        <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-3 pb-md-1 my-3">
          <Row className="mt-2">
            {friendList.map((friend: any) => (
              <Col md={4} lg={6} xl={4} key={friend.id}>
                <FriendsProfileCard
                  friend={friend}
                  popoverOption={popoverOption}
                  handlePopoverOption={handlePopoverOption}
                />
              </Col>
            ))}
          </Row>
        </div>
      </div>
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}

export default ProfileFriends;
