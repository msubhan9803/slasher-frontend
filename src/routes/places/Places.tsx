import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PlacesDetails from './PlacesDetails/PlacesDetails';

function Places() {
  return (
    <Routes>
      <Route path="/1/:id" element={<PlacesDetails />} />
    </Routes>
  );
}

export default Places;
