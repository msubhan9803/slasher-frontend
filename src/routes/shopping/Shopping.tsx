import React from 'react';
import { Route, Routes } from 'react-router-dom';
import BecomeVendor from './become-vendor/BecomeVendor';

function Shopping() {
  return (
    <Routes>
      <Route path="vendor" element={<BecomeVendor />} />
    </Routes>
  );
}

export default Shopping;
