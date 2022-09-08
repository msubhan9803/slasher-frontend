import React from 'react';
import { Route, Routes } from 'react-router-dom';
import EventDetails from './EventDetails/EventDetails';
import EventsByDate from './EventsByDate/EventsByDate';
import EventsByLocation from './EventsByLocation/EventsByLocation';
import Favorites from './Favorites/Favorites';
import EventsSuggestion from './suggestion/EventsSuggestion';

function Events() {
  return (
    <Routes>
      <Route path="/suggestion" element={<EventsSuggestion />} />
      <Route path="/by-location" element={<EventsByLocation />} />
      <Route path="/by-date" element={<EventsByDate />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/:id" element={<EventDetails />} />
    </Routes>
  );
}
export default Events;
