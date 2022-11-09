import React from 'react';
import AdvertisementBox from '../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import FriendRequests from '../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import RecentMessages from '../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import RoundButtonLink from '../../components/ui/RoundButtonLink';

function NotificationsRIghtSideNav() {
  return (
    <>
      <RoundButtonLink
        to="/account/notifications"
        variant="black"
        className="w-100 mb-4"
      >
        Settings
      </RoundButtonLink>
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default NotificationsRIghtSideNav;
