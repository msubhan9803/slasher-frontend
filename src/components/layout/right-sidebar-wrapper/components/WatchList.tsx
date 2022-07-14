import React from 'react';
import WatchListCard from './WatchListCard';

function WatchList() {
  return (
    <>
      <div className="d-flex align-items-end justify-content-between mt-3 mb-2">
        <h2 className="h4 mb-0">Watched list</h2>
        <small className="text-primary">See All</small>
      </div>
      <WatchListCard />
    </>
  );
}

export default WatchList;
