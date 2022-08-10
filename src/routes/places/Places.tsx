import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PlaceFavorites from './PlaceFavorites/PlaceFavorites';

function Places() {
  return (
    <Routes>
      <Route path="favorites" element={<PlaceFavorites />} />
    </Routes>
  );
}

export default Places;
