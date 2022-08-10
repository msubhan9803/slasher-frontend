import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PlaceLocation from './Placelocation/PlaceLocation';

function Places() {
  return (
    <Routes>
      <Route path="by-location" element={<PlaceLocation />} />
    </Routes>
  );
}

export default Places;
