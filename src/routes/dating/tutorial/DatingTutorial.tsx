import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Like from './Like';
import MonsterLike from './MonsterLike';
import PassDeck from './PassDeck';
import Undo from './Undo';

function DatingTutorial() {
  return (
    <Routes>
      <Route path="pass-deck" element={<PassDeck />} />
      <Route path="undo" element={<Undo />} />
      <Route path="monster-likes" element={<MonsterLike />} />
      <Route path="like" element={<Like />} />
    </Routes>
  );
}

export default DatingTutorial;
