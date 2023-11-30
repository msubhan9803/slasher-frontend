import React from 'react';
import AdvertisementBox from '../components/AdvertisementBox';
import Friends from '../components/Friends';
import Photos from '../components/Photos';
import type { User } from '../../../../types';
import WatchedList from '../components/WatchedList';
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

      {/* We are adding padding `p-5` here so that `sticky-bottom-ad` does not
          cover up the content area in the right-sidebar. */}
      <div className="pb-5" />
    </>
  );
}

export default RightSidebarViewer;
