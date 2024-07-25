import React from 'react';
import { useParams } from 'react-router-dom';
import FriendRequests from '../../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import NotificationSetting from '../../../components/layout/right-sidebar-wrapper/components/NotificationSetting';
import RecentMessages from '../../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import AdvertisementBox from '../../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';
import { enableDevFeatures } from '../../../env';
import CreateBusinessListings from '../../../components/layout/right-sidebar-wrapper/components/CreateBusinessListings';

function BooksRightSideNav() {
  const params = useParams();
  return (
    <>
      {enableDevFeatures && params.id
        && (
        <>
          <RoundButtonLink to="/app/books/add" variant="primary" className="w-100 mb-3">Add your book</RoundButtonLink>
          <h1 className="text-center text-primary h3 mb-3">Claim this listing</h1>
        </>
        )}

      <CreateBusinessListings />
      {enableDevFeatures && <NotificationSetting />}
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default BooksRightSideNav;
