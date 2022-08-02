import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddYourMovie from './AddYourMovie';
import MovieData from './MovieData';

function Movies() {
  return (
    <Routes>
      <Route path="/" element={<MovieData />} />
      {/* <Route path="" element={<MovieData />} /> */}
      <Route path="add" element={<AddYourMovie />} />
    </Routes>
  );
}

export default Movies;
