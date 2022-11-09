import React, { useEffect, useState } from 'react';
import {
  Navigate, Route, Routes, useParams,
} from 'react-router-dom';
import ProfileAbout from './ProfileAbout/ProfileAbout';
import ProfileFriends from './ProfileFriends/ProfileFriends';
import ProfilePhotos from './ProfilePhotos/ProfilePhotos';
import ProfilePostDetail from './ProfilePostDetail.tsx/ProfilePostDetail';
import ProfilePosts from './ProfilePosts/ProfilePosts';
import ProfileWatchList from './ProfileWatchList/ProfileWatchList';
import ProfileEdit from './ProfileEdit/ProfileEdit';
import ProfileFriendRequest from './ProfileFriends/ProfileFriendRequest/ProfileFriendRequest';
import { getUser } from '../../api/users';
import { User } from '../../types';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { setOtherUserInitialData } from '../../redux/slices/userNameSlice';
import { useAppDispatch } from '../../redux/hooks';

function Profile() {
  const { userName } = useParams<string>();
  const [user, setUser] = useState<User>();
  const [userNotFound, setUserNotFound] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (userName) {
      getUser(userName)
        .then((res) => {
          setUser(res.data);
          dispatch(setOtherUserInitialData(res.data));
        }).catch(() => setUserNotFound(true));
    }
  }, [userName]);

  if (userNotFound) {
    return <p>User not found</p>;
  }

  if (!user) {
    return <LoadingIndicator />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="posts" replace />} />
      <Route path="/posts" element={<ProfilePosts />} />
      <Route path="/posts/:postId" element={<ProfilePostDetail user={user} />} />
      <Route path="/friends" element={<ProfileFriends user={user} />} />
      <Route path="/friends/request" element={<ProfileFriendRequest user={user} />} />
      <Route path="/about" element={<ProfileAbout user={user} />} />
      <Route path="/photos" element={<ProfilePhotos user={user} />} />
      <Route path="/watched-list" element={<ProfileWatchList user={user} />} />
      <Route path="/edit" element={<ProfileEdit user={user} />} />
    </Routes>
  );
}

export default Profile;
