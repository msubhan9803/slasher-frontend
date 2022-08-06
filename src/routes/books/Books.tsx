import React from 'react';
import { Route, Routes } from 'react-router-dom';
import BooksDetails from './BooksDetails';

function Books() {
  return (
    <Routes>
      <Route path="/1/:id" element={<BooksDetails />} />
    </Routes>
  );
}

export default Books;
