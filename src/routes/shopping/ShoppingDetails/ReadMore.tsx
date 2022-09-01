import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

function ReadMore({ children }: any) {
  const readMoreSmallScreen = useMediaQuery({ query: '(min-width: 768px)' });

  const text = children;
  const [isReadMore, setIsReadMore] = useState(true);
  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };
  return (
    <p className="fs-4 mt-3 mb-0 text-light">
      {!readMoreSmallScreen
        ? (
          <>
            {isReadMore ? text.slice(0, 252) : text}
            <Button variant="link" role="button" onClick={toggleReadMore} className="bg-transparent text-primary ps-1">
              {isReadMore ? '...Read more' : ' Show less'}
            </Button>
          </>
        )
        : text}

    </p>
  );
}

export default ReadMore;
