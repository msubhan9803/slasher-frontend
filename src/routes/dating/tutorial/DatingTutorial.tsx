import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PassDeck from './PassDeck';

function DatingTutorial() {
  return (
    <Routes>
      <Route path="pass-deck" element={<PassDeck />} />
    </Routes>
  );
}

export default DatingTutorial;
