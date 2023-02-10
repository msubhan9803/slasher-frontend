import React from 'react';
import { useParams } from 'react-router-dom';
import FriendRequests from '../../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import NotificationSetting from '../../../components/layout/right-sidebar-wrapper/components/NotificationSetting';
import RecentMessages from '../../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import AdvertisementBox from '../../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';

function ArtsRightSideNav() {
  const params = useParams();
  return (
    <>
      {params.podcastId && <NotificationSetting />}
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default ArtsRightSideNav;
