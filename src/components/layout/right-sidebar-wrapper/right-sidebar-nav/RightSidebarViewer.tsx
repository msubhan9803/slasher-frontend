import React from 'react';
import AdvertisementBox from '../components/AdvertisementBox';
import BooksIhaveRead from '../components/BooksIhaveRead';
import Friends from '../components/Friends';
import Photos from '../components/Photos';
import Podcasts from '../components/Podcasts';
import WatchedList from '../components/WatchedList';

function RightSidebarViewer() {
  return (
    <>
      <AdvertisementBox />
      <WatchedList />
      <Podcasts />
      <BooksIhaveRead />
      <Photos />
      <Friends />
    </>
  );
}

export default RightSidebarViewer;
