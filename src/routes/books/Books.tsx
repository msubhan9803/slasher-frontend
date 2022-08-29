import React from 'react';
import { Route, Routes } from 'react-router-dom';
import BooksData from './BooksData';
import AddYourBook from './AddYourBook';

function Books() {
  return (
    <Routes>
      <Route path="/:id" element={<BooksData />} />
      <Route path="add" element={<AddYourBook />} />
    </Routes>
  );
}

export default Books;
