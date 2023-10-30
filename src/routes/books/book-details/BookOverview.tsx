import React, { useState } from 'react';

function ReadMore({ children }: any) {
  const text = children;
  const [isReadMore, setIsReadMore] = useState(true);
  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };
  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      toggleReadMore();
    }
  };
  return (
    <p className="d-inline">
      {isReadMore ? text.slice(0, 500) : text}
      <span
        onClick={toggleReadMore}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        className="read-or-hide"
      >
        <span className="text-primary cursor-pointer">
          {isReadMore ? ' ...read more' : ' show less'}
        </span>
      </span>
    </p>
  );
}
type BookOverviewProps = { description: string };
function BookOverview({ description }: BookOverviewProps) {
  return (
    <div className="mb-3">
      <div className="bg-dark p-4 rounded-2">
        <h1 className="h2 mb-3 fw-bold">Overview</h1>
        {description && <ReadMore>{description}</ReadMore>}
      </div>
    </div>
  );
}

export default BookOverview;
