import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PassDeck from './PassDeck';
import Undo from './Undo';

function DatingTutorial() {
  return (
    <Routes>
      <Route path="pass-deck" element={<PassDeck />} />
      <Route path="undo" element={<Undo />} />
    </Routes>
  );
}

export default DatingTutorial;
