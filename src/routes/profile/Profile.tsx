import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
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
import {
  FriendRequestReaction, ProfileSubroutesCache, ProfileVisibility, User,
} from '../../types';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import NotFound from '../../components/NotFound';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import RightSidebarViewer from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarViewer';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import PostDetail from '../../components/ui/post/PostDetail';
import ProfileLimitedView from './ProfileLimitedView/ProfileLimitedView';
import RightSidebarAdOnly from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarAdOnly';
import ContentNotAvailable from '../../components/ContentNotAvailable';
import useBootstrapBreakpointName from '../../hooks/useBootstrapBreakpoint';
import { getPageStateCache, setPageStateCache } from '../../pageStateCache';
import { getProfileSubroutesCache } from './profileSubRoutesCacheUtils';
import { setProfilePageUserDetailsReload } from '../../redux/slices/userSlice';

interface SharedHeaderProfilePagesProps {
  user: User;
  isSelfProfile: boolean;
}

function SharedHeaderProfilePages({ user, isSelfProfile }: SharedHeaderProfilePagesProps) {
  return (
    <Routes>
      <Route path="/" element={(<Navigate to="about" replace />)} />
      <Route path="/about" element={<ProfileAbout user={user} />} />
      <Route path="/posts" element={<ProfilePosts user={user} />} />
      <Route path="/posts/:postId" element={<PostDetail user={user} />} />
      <Route path="/friends" element={<ProfileFriends user={user} isSelfProfile={isSelfProfile} />} />
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

  const [user, setUser] = useState<User | undefined>(
    getPageStateCache<ProfileSubroutesCache>(location)?.user,
  );
  const [userNotFound, setUserNotFound] = useState<boolean>(false);
  const [userIsBlocked, setUserIsBlocked] = useState<boolean>(false);

  const loginUserData = useAppSelector((state) => state.user.user);
  const forceProfilePageUserDetailsReload = useAppSelector(
    (state) => state.user.forceProfilePageUserDetailsReload,
  );
  const isSelfProfile = loginUserData.id === user?._id;
  const bp = useBootstrapBreakpointName();
  const lastLocationKeyRef = useRef(location.key);
  const dispatch = useAppDispatch();

  // commented until we enable update username support
  // const checkWithPreviousUserName = useCallback(() => {
  //   getUserByPreviousUserName(userNameOrId!).then((res) => {
  //     navigate(`/${res.data.userName}`);
  //   }).catch((e) => {
  //     if (e.response.status === 404) { setUserNotFound(true); }
  //   });
  // }, [userNameOrId, navigate]);

  /**
   * 1. This function fetch userInfo from api and set in component state.
   * 2. This function can be used when a loggedin user blocks another user
   * to refresh the profile page.
  */
  const loadUser = useCallback(() => {
    getUser(userNameOrId!)
      .then((res) => {
        const userNameFromData: string = res.data.userName;
        if (userNameOrId !== userNameFromData) {
          // Translate this userId-based url to a userName-based URL
          navigate(
            location.pathname.replace(userNameOrId!, userNameFromData) + location.search,
            { replace: true },
          );
          return;
        }
        setUser(res.data);
        setPageStateCache<ProfileSubroutesCache>(location, {
          ...getProfileSubroutesCache(location),
          user: res.data,
        });
      })
      .catch((e) => {
        // If requested user is blocked then show "This content is no longer available" page
        // else a general user not found page is shown.
        if (e.response.status === 403) {
          setUserIsBlocked(true);
        } else {
          // if (e.response.status === 404) { checkWithPreviousUserName(); }
          setUserNotFound(true);
        }
      });
  }, [location, navigate, userNameOrId]);

  useEffect(() => {
    const isSameKey = lastLocationKeyRef.current === location.key;
    if (isSameKey) { return; }
    loadUser();
    // Update lastLocation
    lastLocationKeyRef.current = location.key;
  }, [loadUser, location.key]);

  useEffect(() => {
    if (!userNameOrId) { return; }

    // Fix bug: Go to Profile > AllFriends > OpenAnyProfile > Click back arrow browser button
    // (the profile details remained same which is unintentional).
    const isSameUser = user ? userNameOrId === user.userName : true;
    if (user && isSameUser) { return; }

    loadUser();
  }, [loadUser, user, userNameOrId]);

  useEffect(() => {
    if (forceProfilePageUserDetailsReload) {
      loadUser();
      dispatch(setProfilePageUserDetailsReload(false));
    }
  }, [forceProfilePageUserDetailsReload, loadUser, dispatch]);

  if (userNotFound) { return <NotFound />; }

  if (userIsBlocked) { return (<ContentNotAvailable />); }

  if (!user) { return <LoadingIndicator style={{ marginTop: `${['lg', 'xl', 'xxl'].includes(bp) ? '35vh' : '43vh'}` }} />; }

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
        <h1 className="sr-only">{user.userName}</h1>
        <Routes>
          <Route path="/edit" element={<ProfileEdit user={user} />} />
          <Route path="*" element={<SharedHeaderProfilePages user={user} isSelfProfile={isSelfProfile} />} />
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
