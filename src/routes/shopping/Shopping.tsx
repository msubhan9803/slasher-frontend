import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AllShopping from './shopping-all/AllShopping';
import SlasherDeals from './slasher-deals/SlasherDeals';
import ShoppingFavorites from './shopping-favorites/ShoppingFavorites';
import ShoppingMyListings from './shopping-my-listings/ShoppingMyListings';
import ShoppingDetails from './ShoppingDetails/ShoppingDetails';
import BecomeVendor from './become-vendor/BecomeVendor';

function Shopping() {
  return (
    <Routes>
      <Route path="/*" element={<Navigate to="all" replace />} />
      <Route path="all" element={<AllShopping />} />
      <Route path="slasher-deals" element={<SlasherDeals />} />
      <Route path="favorites" element={<ShoppingFavorites />} />
      <Route path="my-listings" element={<ShoppingMyListings />} />
      <Route path="/:id/:summary" element={<ShoppingDetails />} />
      <Route path="/vendor" element={<BecomeVendor />} />
    </Routes>
  );
}

export default Shopping;
