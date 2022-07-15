import React from 'react';
import PodcastsCard from './PodcastsCard';

function Podcasts() {
  return (
    <>
      <div className="d-flex align-items-end justify-content-between mt-3 mb-2">
        <h2 className="h4 mb-0">Podcasts</h2>
        <small className="text-primary">See All</small>
      </div>
      <PodcastsCard />
    </>
  );
}

export default Podcasts;
