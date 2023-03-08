import React from 'react';

interface BasicBooksIndexProps {
  books: []
}

function BasicBooksIndexList({ books }: BasicBooksIndexProps) {
  return (
    <div>
      <div>
        {books.map((book: any) => (
          <div className="py-3 fw-bold" key={book._id} style={{ borderBottom: '1px solid var(--stroke-and-line-separator-color)' }}>
            {book.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BasicBooksIndexList;
