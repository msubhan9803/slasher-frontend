import React from 'react';
import RecentMessage from '../components/RecentMessage';
import FriendRequest from '../components/FriendRequest';
import AdvertisementBox from '../components/AdvertisementBox';

function RightSidebarSelf() {
  return (
    <>
      <AdvertisementBox />
      <RecentMessage />
      <FriendRequest />
    </>
  );
}

export default RightSidebarSelf;
