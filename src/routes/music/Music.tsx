import React from 'react';
import { Route, Routes } from 'react-router-dom';
import BasicMusicIndex from './BasicMusicIndex';

function Music() {
  return (
    <Routes>
      <Route path="/" element={<BasicMusicIndex />} />
    </Routes>
  );
}
export default Music;
