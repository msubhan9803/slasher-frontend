import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UnauthenticatedPageWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedPageWrapper';
import NotFound from '../../components/NotFound';
import CreatePost from './create-post/CreatePost';

function Posts() {
  return (
    <Routes>
      <Route path="create" element={<CreatePost />} />
      <Route path="*" element={<UnauthenticatedPageWrapper><NotFound /></UnauthenticatedPageWrapper>} />
    </Routes>
  );
}

export default Posts;
