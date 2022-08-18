import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FriendRequests from '../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import RecentMessages from '../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import RoundButton from '../../components/ui/RoundButton';
import AdvertisementBox from '../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import NotificationSetting from './NotificationSetting';

function PlaceRightSidebar() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  return (
    <>
      <Link to="/places/posts">
        <RoundButton className={`w-100 fs-4 ${queryParam === 'self' && ' mb-3'}`}>Add your place</RoundButton>
      </Link>
      {queryParam !== 'self'
        && <NotificationSetting />}
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default PlaceRightSidebar;
