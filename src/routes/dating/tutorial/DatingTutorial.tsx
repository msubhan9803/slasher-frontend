import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DatingMessages from './DatingMessages';
import Like from './Like';
import MonsterLike from './MonsterLike';
import PassDeck from './PassDeck';
import Undo from './Undo';
import DatingLikes from './DatingLikes';

function DatingTutorial() {
  return (
    <Routes>
      <Route path="pass-deck" element={<PassDeck />} />
      <Route path="undo" element={<Undo />} />
      <Route path="monster-likes" element={<MonsterLike />} />
      <Route path="like" element={<Like />} />
      <Route path="dating-messages" element={<DatingMessages />} />
      <Route path="dating-likes" element={<DatingLikes />} />
    </Routes>
  );
}

export default DatingTutorial;
