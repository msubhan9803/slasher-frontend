import React from 'react';
import AdvertisementBox from '../components/AdvertisementBox';
import BooksIhaveRead from '../components/BooksIhaveRead';
import Friends from '../components/Friends';
import Photos from '../components/Photos';
import Podcasts from '../components/Podcasts';
import WatchList from '../components/WatchList';

function RightSidebarViewer() {
  return (
    <>
      <AdvertisementBox />
      <WatchList />
      <Podcasts />
      <BooksIhaveRead />
      <Photos />
      <Friends />
    </>
  );
}

export default RightSidebarViewer;
