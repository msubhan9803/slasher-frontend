import React from 'react';
import { useParams } from 'react-router-dom';
import AdvertisementBox from '../../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import FriendRequests from '../../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import NotificationSetting from '../../../components/layout/right-sidebar-wrapper/components/NotificationSetting';
import RecentMessages from '../../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import RoundButton from '../../../components/ui/RoundButton';

function BooksRigthSideNav() {
  const params = useParams();
  return (
    <>
      <RoundButton className="w-100 mb-4 fs-3 fw-bold">Add your book</RoundButton>
      {params.id && params.summary && <NotificationSetting />}
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default BooksRigthSideNav;
