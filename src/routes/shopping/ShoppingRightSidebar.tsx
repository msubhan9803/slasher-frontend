import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdvertisementBox from '../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import FriendRequests from '../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import RecentMessages from '../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import RoundButton from '../../components/ui/RoundButton';
import NotificationSetting from './NotificationSetting';

function ShoppingRightSidebar() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  return (
    <>
      <Link to="/shopping/vendor">
        <RoundButton className="w-100 mb-4 fs-4">Become a vendor</RoundButton>
      </Link>
      {queryParam === 'self'
        && <NotificationSetting />}
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default ShoppingRightSidebar;
