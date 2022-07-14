import React from 'react';
import FriendRequestCard from './FriendRequestCard';

function FriendRequest() {
  return (
    <>
      <div className="d-flex align-items-end justify-content-between mt-4 mb-2">
        <h3 className="h4 mb-0">Friend requests</h3>
        <small className="text-primary">View All</small>
      </div>
      <FriendRequestCard />
    </>
  );
}

export default FriendRequest;
