import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddYourPlace from './add-your-place/AddYourPlace';
import PlaceFavorites from './PlaceFavorites/PlaceFavorites';
import PlaceCategory from './PlaceCategory/PlaceCategory';
import PlaceLocation from './Placelocation/PlaceLocation';
import PlacesDetails from './PlacesDetails/PlacesDetails';

function Places() {
  return (
    <Routes>
      <Route path="add" element={<AddYourPlace />} />
      <Route path="favorites" element={<PlaceFavorites />} />
      <Route path="by-category" element={<PlaceCategory />} />
      <Route path="by-location" element={<PlaceLocation />} />
      <Route path="/1/:id" element={<PlacesDetails />} />
    </Routes>
  );
}

export default Places;
