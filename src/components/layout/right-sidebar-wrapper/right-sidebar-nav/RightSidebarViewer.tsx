import React from 'react';
import AdvertisementBox from '../components/AdvertisementBox';
import Friends from '../components/Friends';
import Photos from '../components/Photos';
import type { User } from '../../../../types';
// import Podcasts from '../components/Podcasts';
// import WatchedList from '../components/WatchedList';

type RightSidebarViewerType = { user: User };

function RightSidebarViewer({ user } : RightSidebarViewerType) {
  return (
    <>
      <AdvertisementBox />
      {/* <WatchedList /> */}
      {/* <Podcasts /> */}
      {/* <BooksIhaveRead /> */}
      <Photos user={user} />
      <Friends user={user} />
    </>
  );
}

export default RightSidebarViewer;
