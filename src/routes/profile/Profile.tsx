import React from 'react';
import {
  Navigate, Route, Routes,
} from 'react-router-dom';
import ProfileAbout from './ProfileAbout/ProfileAbout';
import ProfileFriends from './ProfileFriends/ProfileFriends';
import ProfilePhotos from './ProfilePhotos/ProfilePhotos';
import ProfilePostDetail from './ProfilePostDetail.tsx/ProfilePostDetail';
import ProfilePosts from './ProfilePosts/ProfilePosts';
import ProfileWatchList from './ProfileWatchList/ProfileWatchList';

function Profile() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="posts" replace />} />
      <Route path="/posts" element={<ProfilePosts />} />
      <Route path="/posts/:id" element={<ProfilePostDetail />} />
      <Route path="/friends" element={<ProfileFriends />} />
      <Route path="/about" element={<ProfileAbout />} />
      <Route path="/photos" element={<ProfilePhotos />} />
      <Route path="/watched-list" element={<ProfileWatchList />} />
    </Routes>
  );
}

export default Profile;
