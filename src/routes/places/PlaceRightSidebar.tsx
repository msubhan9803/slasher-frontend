import React from 'react';
import { Link } from 'react-router-dom';
import FriendRequests from '../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import RecentMessages from '../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import RoundButton from '../../components/ui/RoundButton';
import AdvertisementBox from '../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';

function PlaceRightSidebar() {
  return (
    <>
      <Link to="/places/favorites">
        <RoundButton className="w-100 mb-4 fs-4">Add your place</RoundButton>
      </Link>
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default PlaceRightSidebar;
