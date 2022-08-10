import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PlaceCategory from './PlaceCategory/PlaceCategory';

function Places() {
  return (
    <Routes>
      <Route path="category" element={<PlaceCategory />} />
    </Routes>
  );
}

export default Places;
