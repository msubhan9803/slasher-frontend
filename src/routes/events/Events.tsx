import React from 'react';
import { Route, Routes } from 'react-router-dom';
import EventsSuggestion from './suggestion/EventsSuggestion';

function Events() {
  return (
    <Routes>
      <Route path="/suggestion" element={<EventsSuggestion />} />
    </Routes>
  );
}
export default Events;
