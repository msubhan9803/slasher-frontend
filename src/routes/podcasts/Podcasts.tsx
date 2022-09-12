import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PodcastsList from './PodcastsList';

function Podcasts() {
  return (
    <Routes>
      <Route path="" element={<PodcastsList />} />
    </Routes>
  );
}

export default Podcasts;
