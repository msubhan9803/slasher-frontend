import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddYourPlace from './add-your-place/AddYourPlace';
import PlaceFavorites from './PlaceFavorites/PlaceFavorites';

function Places() {
  return (
    <Routes>
      <Route path="add" element={<AddYourPlace />} />
      <Route path="favorites" element={<PlaceFavorites />} />
    </Routes>
  );
}

export default Places;
