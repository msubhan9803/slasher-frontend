import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AllShopping from './shopping-all/AllShopping';

function Shopping() {
  return (
    <Routes>
      <Route path="all" element={<AllShopping />} />
    </Routes>
  );
}

export default Shopping;
