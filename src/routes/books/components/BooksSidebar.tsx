import React from 'react';
import { Link } from 'react-router-dom';
import FriendRequests from '../../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import RoundButton from '../../../components/ui/RoundButton';
import AdvertisementBox from '../../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import RecentMessages from '../../../components/layout/right-sidebar-wrapper/components/RecentMessages';

function BooksSidebar() {
  return (
    <>
      <Link to="/books">
        <RoundButton className="w-100 mb-4 fs-4">Add your book</RoundButton>
      </Link>
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default BooksSidebar;
