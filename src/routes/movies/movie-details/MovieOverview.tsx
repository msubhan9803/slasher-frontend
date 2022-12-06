import React from 'react';

interface Props {
  overView: string;
}

function MovieOverview({ overView }: Props) {
  return (
    <div className="bg-dark p-3 rounded-2">
      <h1 className="h2 mb-3 fw-bold">Overview</h1>
      <span className="h4 text-light">
        {overView}
      </span>
    </div>
  );
}

export default MovieOverview;
