import React from 'react';
import {
  Navigate, Route, Routes,
} from 'react-router-dom';
import ProfileFriends from './ProfileFriends';
import ProfilePosts from './ProfilePosts';

function Profile() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="posts" replace />} />
      <Route path="/posts" element={<ProfilePosts />} />
      <Route path="/friends" element={<ProfileFriends />} />
      <Route path="/about" element={<ProfileFriends />} />
      <Route path="/photos" element={<ProfileFriends />} />
      <Route path="/watchedList" element={<ProfileFriends />} />
    </Routes>
  );
}

export default Profile;
