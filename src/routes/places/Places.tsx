import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddYourPlace from './AddYourPlace';

function Places() {
  return (
    <Routes>
      <Route path="add" element={<AddYourPlace />} />
    </Routes>
  );
}

export default Places;
