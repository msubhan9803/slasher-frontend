import React from 'react';
import AdvertisementBox from '../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import FriendRequests from '../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import NotificationSetting from '../../components/layout/right-sidebar-wrapper/components/NotificationSetting';
import RecentMessages from '../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import RoundButton from '../../components/ui/RoundButton';

function BooksRigthSideNav() {
  return (
    <>
      <RoundButton className="w-100 mb-4 fs-4">Add your book</RoundButton>
      <NotificationSetting />
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default BooksRigthSideNav;
