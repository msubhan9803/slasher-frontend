import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PodcastDetail from './PodcastDetail';
import PodcastsList from './PodcastsList';

function Podcasts() {
  return (
    <Routes>
      <Route path=":podcastId/episodes" element={<PodcastDetail />} />
      <Route path="" element={<PodcastsList />} />
    </Routes>
  );
}

export default Podcasts;
