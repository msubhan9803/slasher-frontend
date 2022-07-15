import React from 'react';
import PhotosCard from './PhotosCard';

function Photos() {
  return (
    <>
      <div className="d-flex align-items-end justify-content-between mt-3 mb-2">
        <h2 className="h4 mb-0">Photos</h2>
        <small className="text-primary">See All</small>
      </div>
      <PhotosCard />
    </>
  );
}

export default Photos;
