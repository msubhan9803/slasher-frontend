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
function BookOverview() {
  return (
    <div className="mb-3">
      <div className="bg-dark p-4 rounded-2">
        <h1 className="h2 mb-3 fw-bold">Overview</h1>
        <ReadMore>
          Contrary to popular belief, Lorem Ipsum is not simply random text.
          It has roots in a piece of classical Latin literature from 45 BC,
          making it over 2000 years old. Richard McClintock, a Latin professor at
          Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words,
          consectetur, from a Lorem Ipsum passage, and going through the cites of the word
          in classical literature, discovered the undoubtable source. Lorem Ipsum comes
          from sections 1.10.32 and 1.10.33 of &quot;de Finibus Bonorum et Malorum &quot;
          (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a
          treatise on the theory of ethics, very popular during the Renaissance.
          The first line of Lorem Ipsum, &quot;Lorem ipsum dolor sit amet..&quot;,
          comes from a line in section 1.10.32, and going through the cites of the word
          in classical literature, discovered the undoubtable source.
        </ReadMore>
      </div>
    </div>
  );
}

export default BookOverview;
