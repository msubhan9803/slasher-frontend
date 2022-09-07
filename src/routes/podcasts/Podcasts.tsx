import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PodcastDetail from './PodcastDetail';

function Podcasts() {
  return (
    <Routes>
      <Route path=":id/*" element={<PodcastDetail />} />
    </Routes>
  );
}

export default Podcasts;
