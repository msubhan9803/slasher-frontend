import React from 'react';
import { Route, Routes } from 'react-router-dom';
import NotFound from '../../components/NotFound';
import CreatePost from './create-post/CreatePost';

function Posts() {
  return (
    <Routes>
      <Route path="create" element={<CreatePost />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Posts;
