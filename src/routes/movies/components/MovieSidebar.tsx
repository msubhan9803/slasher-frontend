import React from 'react';
import { Link } from 'react-router-dom';
import AdvertisementBox from '../../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import FriendRequests from '../../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import RecentMessages from '../../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import RoundButton from '../../../components/ui/RoundButton';

function MovieSidebar() {
  return (
    <>
      <Link to="/movies/add">
        <RoundButton className="w-100 mb-4 fs-4">Add your movie</RoundButton>
      </Link>
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default MovieSidebar;
