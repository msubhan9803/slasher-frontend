import React from 'react';
import AdvertisementBox from '../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import FriendRequests from '../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import RecentMessages from '../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import RoundButtonLink from '../../components/ui/RoundButtonLink';

function EventRightSidebar() {
  return (
    <>
      <RoundButtonLink to="/app/events/suggestion" variant="primary" className="w-100 mb-3">Suggest event</RoundButtonLink>
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default EventRightSidebar;
