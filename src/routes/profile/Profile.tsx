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
import { useAppSelector } from '../../redux/hooks';
import NotFound from '../../components/NotFound';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import RightSidebarViewer from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarViewer';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';

function Profile() {
  const loginUserData = useAppSelector((state) => state.user.user);
  const { userName: userNameOrId } = useParams<string>();
  const [user, setUser] = useState<User>();
  const [userNotFound, setUserNotFound] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  /* eslint no-underscore-dangle: 0 */
  const isSelfProfile = loginUserData.id === user?._id;
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
        }).catch(() => setUserNotFound(true));
    }
  }, [userNameOrId, location.pathname, location.search, navigate]);

  if (userNotFound) {
    return (
      <NotFound />
    );
  }

  if (!user) {
    return <LoadingIndicator />;
  }

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Routes>
          <Route path="/" element={<Navigate to="posts" replace />} />
          <Route path="/posts" element={<ProfilePosts user={user} />} />
          <Route path="/posts/:postId" element={<ProfilePostDetail user={user} />} />
          <Route path="/friends" element={<ProfileFriends user={user} />} />
          <Route path="/friends/request" element={<ProfileFriendRequest user={user} />} />
          <Route path="/about" element={<ProfileAbout user={user} />} />
          <Route path="/photos" element={<ProfilePhotos user={user} />} />
          <Route path="/watched-list" element={<ProfileWatchList user={user} />} />
          <Route path="/edit" element={<ProfileEdit user={user} />} />
        </Routes>
      </ContentPageWrapper>

      {/* Global right sidebar for all above routes */}
      <RightSidebarWrapper>
        {isSelfProfile ? <RightSidebarSelf /> : <RightSidebarViewer user={user} />}
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default Profile;
