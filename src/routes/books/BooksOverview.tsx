import React from 'react';
import BookComments from './components/BookComments';
import BookOverview from './components/BookOverview';

function BooksOverview() {
  return (
    <div>
      <BookOverview />
      <BookComments />
    </div>
  );
}

export default BooksOverview;
