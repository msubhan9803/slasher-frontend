import React from 'react';
import { Link } from 'react-router-dom';
import AdvertisementBox from '../../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import FriendRequests from '../../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import NotificationSetting from '../../../components/layout/right-sidebar-wrapper/components/NotificationSetting';
import RecentMessages from '../../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import RoundButton from '../../../components/ui/RoundButton';

function PodcastsSidebar() {
  return (
    <>
      <Link to="/podcasts">
        <RoundButton className="w-100 mb-4 fs-3 fw-bold">Add my podcast</RoundButton>
      </Link>
      <NotificationSetting />
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default PodcastsSidebar;
