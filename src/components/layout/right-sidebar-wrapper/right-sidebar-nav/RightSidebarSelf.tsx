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

      {/* We are adding padding `p-5` here so that `sticky-bottom-ad` does not
          cover up the content area in the right-sidebar. */}
      <div className="pb-5" />
    </>
  );
}

export default RightSidebarSelf;
