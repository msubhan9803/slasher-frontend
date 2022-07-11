import React from 'react';
import { Col } from 'react-bootstrap';
import RecentMessage from '../components/RecentMessage';
import FriendRequest from '../components/FriendRequest';
import AdvertisementBox from '../components/AdvertisementBox';

function RightSidebarSelf() {
  return (
    <Col className="d-none d-md-block">
      <AdvertisementBox />
      <RecentMessage />
      <FriendRequest />
    </Col>
  );
}

export default RightSidebarSelf;
