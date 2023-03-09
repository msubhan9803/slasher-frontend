import React from 'react';
import AutoplayCarousel from '../components/AutoplayCarousel';

function UserReview() {
  return (
    <div className="mt-5 p-3">
      <h1 className="h2 text-center">
        WHAT PEOPLE ARE
        <br />
        SAYING ABOUT SLASHER
      </h1>

      <AutoplayCarousel />
    </div>
  );
}

export default UserReview;
