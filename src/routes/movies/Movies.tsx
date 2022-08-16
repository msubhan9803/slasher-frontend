import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddYourMovie from './AddYourMovie';
import MovieData from './MovieData';
import MovieDetails from './MovieDetails';

function Movies() {
  return (
    <Routes>
      <Route path="/:id" element={<MovieData />} />
      <Route path="add" element={<AddYourMovie />} />
      <Route path="details" element={<MovieDetails />} />
    </Routes>
  );
}

export default Movies;
