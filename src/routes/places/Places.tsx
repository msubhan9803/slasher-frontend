import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PlaceMyplaces from './PlaceMyplaces/PlaceMyplaces';

function Places() {
  return (
    <Routes>
      <Route path="my-places" element={<PlaceMyplaces />} />
    </Routes>
  );
}

export default Places;
