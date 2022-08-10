import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PlaceNewest from './PlaceNewest/PlaceNewest';

function Places() {
  return (
    <Routes>
      <Route path="newest" element={<PlaceNewest />} />
    </Routes>
  );
}

export default Places;
