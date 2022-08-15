import React from 'react';
import { Route, Routes } from 'react-router-dom';
import BooksData from './BooksData';

function Books() {
  return (
    <Routes>
      <Route path="/:id" element={<BooksData />} />
    </Routes>
  );
}

export default Books;
