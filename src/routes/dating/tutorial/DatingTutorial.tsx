import React from 'react';
import { Route, Routes } from 'react-router-dom';
import TutorialDatingMessages from './TutorialDatingMessages';
import TutorialLike from './TutorialLike';
import TutorialMonsterLike from './TutorialMonsterLike';
import TutorialPassDeck from './TutorialPassDeck';
import TutorialProfile from './TutorialProfile';
import TutorialDatingLikes from './TutorialDatingLikes';
import TutorialUndo from './TutorialUndo';

function DatingTutorial() {
  return (
    <Routes>
      <Route path="pass-deck" element={<TutorialPassDeck />} />
      <Route path="undo" element={<TutorialUndo />} />
      <Route path="monster-like" element={<TutorialMonsterLike />} />
      <Route path="like" element={<TutorialLike />} />
      <Route path="dating-messages" element={<TutorialDatingMessages />} />
      <Route path="dating-likes" element={<TutorialDatingLikes />} />
      <Route path="profile" element={<TutorialProfile />} />
    </Routes>
  );
}

export default DatingTutorial;
