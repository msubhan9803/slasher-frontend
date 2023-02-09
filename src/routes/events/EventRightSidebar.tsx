import React from 'react';
import { Link } from 'react-router-dom';
import AdvertisementBox from '../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import FriendRequests from '../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import RecentMessages from '../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import RoundButton from '../../components/ui/RoundButton';

function EventRightSidebar() {
  return (
    <>
      <Link to="/app/events/suggestion">
        <RoundButton className="w-100 mb-4 fs-4">Suggest event</RoundButton>
      </Link>
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default EventRightSidebar;
