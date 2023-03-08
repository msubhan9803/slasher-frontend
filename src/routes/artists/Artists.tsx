import React from 'react';
import { Route, Routes } from 'react-router-dom';
import BasicArtistsIndex from './BasicArtistsIndex';

function Astists() {
  return (
    <Routes>
      <Route path="/" element={<BasicArtistsIndex />} />
    </Routes>
  );
}

export default Astists;
