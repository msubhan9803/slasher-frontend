import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddYourMovie from './AddYourMovie';
import MovieDetails from './MovieDetails';

function Movies() {
  return (
    <Routes>
      <Route path="add" element={<AddYourMovie />} />
      <Route path="details" element={<MovieDetails />} />
    </Routes>
  );
}

export default Movies;
