import React from 'react';
import AdvertisementBox from '../components/AdvertisementBox';
import Friends from '../components/Friends';
import Photos from '../components/Photos';
import type { User } from '../../../../types';
import WatchedList from '../components/WatchedList';
import SticyBannerAdSpaceCompensation from '../../../SticyBannerAdSpaceCompensation';
// import Podcasts from '../components/Podcasts';
// import WatchedList from '../components/WatchedList';

type RightSidebarViewerType = { user: User };

function RightSidebarViewer({ user }: RightSidebarViewerType) {
  return (
    <>
      <AdvertisementBox />
      {/* <Podcasts /> */}
      {/* <BooksIhaveRead /> */}
      <Photos user={user} />
      <Friends user={user} />
      <WatchedList user={user} />

      <SticyBannerAdSpaceCompensation />
    </>
  );
}

export default RightSidebarViewer;
