import React from 'react';
import RecentMessages from '../components/RecentMessages';
import FriendRequests from '../components/FriendRequests';
import AdvertisementBox from '../components/AdvertisementBox';

function RightSidebarSelf() {
  return (
    <>
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default RightSidebarSelf;
