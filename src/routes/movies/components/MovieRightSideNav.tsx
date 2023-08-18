import React from 'react';
import { useParams } from 'react-router-dom';
import AdvertisementBox from '../../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import FriendRequests from '../../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import NotificationSetting from '../../../components/layout/right-sidebar-wrapper/components/NotificationSetting';
import RecentMessages from '../../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';
import { enableDevFeatures } from '../../../env';

function MovieRightSideNav() {
  const params = useParams();
  return (
    <>
      {
        enableDevFeatures
        && <RoundButtonLink to="/app/movies/add" variant="primary" className="w-100 mb-3">Add your movie</RoundButtonLink>
      }
      {params.id && params.summary && <NotificationSetting />}
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default MovieRightSideNav;
