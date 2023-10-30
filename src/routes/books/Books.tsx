import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AllBooks from './all-books/AllBooks';
import BookDetails from './book-details/BookDetails';
import BuyListBooks from './buy-list-books/BuyListBooks';
import FavoriteBooks from './favorite-books/FavoriteBooks';
import MyBooks from './my-books/MyBooks';
import ReadBooks from './read-books/ReadBooks';
import ReadingListBooks from './reading-list-books/ReadingListBooks';
import SlasherIndieBooks from './slasher-indie-books/SlasherIndieBooks';
import AddYourBook from './AddYourBook';
// import BasicBooksIndex from './BasicBooksIndex';

function Books() {
  return (
    <Routes>
      <Route path="/*" element={<Navigate to="all" replace />} />
      {/* <Route path="/" element={<BasicBooksIndex />} /> */}
      <Route path="all" element={<AllBooks />} />
      <Route path="slasher-indie" element={<SlasherIndieBooks />} />
      <Route path="favorites" element={<FavoriteBooks />} />
      <Route path="read" element={<ReadBooks />} />
      <Route path="reading-list" element={<ReadingListBooks />} />
      <Route path="buy-list" element={<BuyListBooks />} />
      <Route path="my-books" element={<MyBooks />} />
      <Route path="add" element={<AddYourBook />} />
      <Route path=":id/*" element={<BookDetails />} />
      <Route path="*" element={<Navigate to="all" replace />} />
    </Routes>
  );
}

export default Books;
