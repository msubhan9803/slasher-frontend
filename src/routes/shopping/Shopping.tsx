import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AllShopping from './shopping-all/AllShopping';
import SlasherDeals from './slasher-deals/SlasherDeals';
import ShoppingFavorites from './shopping-favorites/ShoppingFavorites';
import ShoppingMyListings from './shopping-my-listings/ShoppingMyListings';
import ShoppingDetails from './ShoppingDetails/ShoppingDetails';

function Shopping() {
  return (
    <Routes>
      <Route path="all" element={<AllShopping />} />
      <Route path="slasher-deals" element={<SlasherDeals />} />
      <Route path="favorites" element={<ShoppingFavorites />} />
      <Route path="my-listings" element={<ShoppingMyListings />} />
      <Route path="/1/:id" element={<ShoppingDetails />} />
    </Routes>
  );
}

export default Shopping;
