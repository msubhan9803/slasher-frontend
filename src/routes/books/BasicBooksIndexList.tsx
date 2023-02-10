import React from 'react';
import { CustomTable, TableRow } from '../../components/ui/customTable';

interface BasicBooksIndexProps {
  books: []
}

function BasicBooksIndexList({ books }: BasicBooksIndexProps) {
  return (
    <div>
      <CustomTable>
        {books.map((book: any) => (
          <TableRow key={book._id}>
            {book.name}
          </TableRow>
        ))}
      </CustomTable>
    </div>
  );
}

export default BasicBooksIndexList;
