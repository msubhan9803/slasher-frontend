import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddYourMovie from './AddYourMovie';
import MovieData from './MovieData';
import MovieDetails from './MovieDetails';

function Movies() {
  return (
    <Routes>
      <Route path="/:id" element={<MovieData />} />
      <Route path="1/:id" element={<MovieDetails />} />
      <Route path="add" element={<AddYourMovie />} />
    </Routes>
  );
}

export default Movies;
