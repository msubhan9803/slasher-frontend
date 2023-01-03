import React, { useEffect, useState } from 'react';
import {
  Navigate, Route, Routes, useLocation, useNavigate, useParams,
} from 'react-router-dom';
import ProfileAbout from './ProfileAbout/ProfileAbout';
import ProfileFriends from './ProfileFriends/ProfileFriends';
import ProfilePhotos from './ProfilePhotos/ProfilePhotos';
import ProfilePostDetail from './ProfilePostDetail/ProfilePostDetail';
import ProfilePosts from './ProfilePosts/ProfilePosts';
import ProfileWatchList from './ProfileWatchList/ProfileWatchList';
import ProfileEdit from './ProfileEdit/ProfileEdit';
import ProfileFriendRequest from './ProfileFriends/ProfileFriendRequest/ProfileFriendRequest';
import { getUser } from '../../api/users';
import { User } from '../../types';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { setSidebarUserData } from '../../redux/slices/sidebarContextSlice';
import { useAppDispatch } from '../../redux/hooks';
import UnauthenticatedPageWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedPageWrapper';
import NotFound from '../../components/NotFound';

function Profile() {
  const { userName: userNameOrId } = useParams<string>();
  const [user, setUser] = useState<User>();
  const [userNotFound, setUserNotFound] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (userNameOrId) {
      getUser(userNameOrId)
        .then((res) => {
          const userNameFromData: string = res.data.userName;
          if (userNameOrId !== userNameFromData) {
            // Translate this userId-based url to a userName-based URL
            navigate(
              location.pathname.replace(userNameOrId, userNameFromData) + location.search,
              { replace: true },
            );
            return;
          }
          setUser(res.data);
          dispatch(setSidebarUserData(res.data));
        }).catch(() => setUserNotFound(true));
    }
  }, [userNameOrId]);

  if (userNotFound) {
    return (
      <UnauthenticatedPageWrapper>
        <NotFound />
      </UnauthenticatedPageWrapper>
    );
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
