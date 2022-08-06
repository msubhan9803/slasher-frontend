import React from 'react';
import { Route, Routes } from 'react-router-dom';
import BookDetails from './BookDetails';

function Books() {
  return (
    <Routes>
      <Route path="/1/:id" element={<BookDetails />} />
    </Routes>
  );
}

export default Books;
