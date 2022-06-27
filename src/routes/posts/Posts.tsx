import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import NotFound from '../../components/NotFound';
import CreatePost from './create-post/CreatePost';

function Posts() {
  return (
    <Routes>
      <Route path="create" element={<CreatePost />} />
      <Route path="*" element={<AuthenticatedPageWrapper><NotFound /></AuthenticatedPageWrapper>} />
    </Routes>
  );
}

export default Posts;
