import React from 'react';
import { Route, Routes } from 'react-router-dom';
import BasicPodcastsIndex from './BasicPodcastsIndex';
import PodcastDetail from './PodcastDetail';

function Podcasts() {
  return (
    <Routes>
      <Route path="/" element={<BasicPodcastsIndex />} />
      <Route path=":podcastId/episodes" element={<PodcastDetail />} />
    </Routes>
  );
}

export default Podcasts;
