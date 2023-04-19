import React, { useEffect, useState } from 'react';
import {
  Navigate, Route, Routes, useLocation, useNavigate, useParams,
} from 'react-router-dom';
import ProfileAbout from './ProfileAbout/ProfileAbout';
import ProfileFriends from './ProfileFriends/ProfileFriends';
import ProfilePhotos from './ProfilePhotos/ProfilePhotos';
import ProfilePosts from './ProfilePosts/ProfilePosts';
import ProfileWatchList from './ProfileWatchList/ProfileWatchList';
import ProfileEdit from './ProfileEdit/ProfileEdit';
import ProfileFriendRequest from './ProfileFriends/ProfileFriendRequest/ProfileFriendRequest';
import { getUser } from '../../api/users';
import { FriendRequestReaction, ProfileVisibility, User } from '../../types';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { useAppSelector } from '../../redux/hooks';
import NotFound from '../../components/NotFound';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import RightSidebarViewer from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarViewer';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import PostDetail from '../../components/ui/post/PostDetail';
import ProfileLimitedView from './ProfileLimitedView/ProfileLimitedView';
import RightSidebarAdOnly from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarAdOnly';

interface SharedHeaderProfilePagesProps {
  user: User;
}

function SharedHeaderProfilePages({ user }: SharedHeaderProfilePagesProps) {
  return (
    <Routes>
      <Route path="/" element={(<Navigate to="about" replace />)} />
      <Route path="/about" element={<ProfileAbout user={user} />} />
      <Route path="/posts" element={<ProfilePosts user={user} />} />
      <Route path="/posts/:postId" element={<PostDetail user={user} />} />
      <Route path="/friends" element={<ProfileFriends user={user} />} />
      <Route path="/friends/request" element={<ProfileFriendRequest user={user} />} />
      <Route path="/photos" element={<ProfilePhotos user={user} />} />
      <Route path="/watched-list" element={<ProfileWatchList user={user} />} />
      <Route path="/edit" element={<ProfileEdit user={user} />} />
    </Routes>
  );
}

function Profile() {
  const { userName: userNameOrId } = useParams<string>();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User>();
  const [userNotFound, setUserNotFound] = useState<boolean>(false);

  const loginUserData = useAppSelector((state) => state.user.user);
  const isSelfProfile = loginUserData.id === user?._id;

  useEffect(() => {
    if (!userNameOrId || user) { return; }

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
  }, [user, userNameOrId, location.pathname, location.search, navigate]);

  if (userNotFound) { return <NotFound />; }
  if (!user) { return <LoadingIndicator />; }

  if (userNameOrId !== user.userName) {
    setUser(undefined);
  }

  if (!isSelfProfile
    && user.profile_status !== ProfileVisibility.Public
    && user.friendshipStatus.reaction !== FriendRequestReaction.Accepted) {
    return (
      <ContentSidbarWrapper>
        <ContentPageWrapper>
          <ProfileLimitedView user={user} />
        </ContentPageWrapper>

        <RightSidebarWrapper>
          <RightSidebarAdOnly />
        </RightSidebarWrapper>
      </ContentSidbarWrapper>
    );
  }

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Routes>
          <Route path="/edit" element={<ProfileEdit user={user} />} />
          <Route path="*" element={<SharedHeaderProfilePages user={user} />} />
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
