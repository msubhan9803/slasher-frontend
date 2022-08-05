import React from 'react';
import { Route, Routes } from 'react-router-dom';
import BooksPost from './BooksPost';

function Books() {
  return (
    <Routes>
      <Route path="/1/:id" element={<BooksPost />} />
    </Routes>
  );
}

export default Books;
