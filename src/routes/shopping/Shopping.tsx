import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ShoppingDetails from './ShoppingDetails/ShoppingDetails';

function Shopping() {
  return (
    <Routes>
      <Route path="/1/:id" element={<ShoppingDetails />} />
    </Routes>
  );
}

export default Shopping;
