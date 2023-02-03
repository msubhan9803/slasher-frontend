import React from 'react';
import AdvertisementBox from '../components/AdvertisementBox';
import Friends from '../components/Friends';
import Photos from '../components/Photos';

function RightSidebarViewer() {
  return (
    <>
      <AdvertisementBox />
      {/* <WatchedList /> */}
      {/* <Podcasts /> */}
      {/* <BooksIhaveRead /> */}
      <Photos />
      <Friends />
    </>
  );
}

export default RightSidebarViewer;
