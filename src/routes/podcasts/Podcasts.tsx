import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PodcastDetail from './PodcastDetail';

function Podcasts() {
  return (
    <Routes>
      <Route path="1" element={<PodcastDetail />} />
    </Routes>
  );
}

export default Podcasts;
