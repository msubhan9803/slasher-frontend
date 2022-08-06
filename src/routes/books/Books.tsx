import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddYourBook from './AddYourBook';

function Books() {
  return (
    <Routes>
      <Route path="add" element={<AddYourBook />} />
    </Routes>
  );
}

export default Books;
