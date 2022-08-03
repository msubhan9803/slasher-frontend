import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddYourMovie from './AddYourMovie';

function Movies() {
  return (
    <Routes>
      <Route path="add" element={<AddYourMovie />} />
    </Routes>
  );
}

export default Movies;
