import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { Offcanvas } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import SidebarNavContent from '../../sidebar-nav/SidebarNavContent';
import AuthenticatedPageHeader from './AuthenticatedPageHeader';
import MobileOnlySidebarContent from '../../sidebar-nav/MobileOnlySidebarContent';
import { userInitialData } from '../../../../api/users';
import {
  setUserInitialData, handleUpdatedUnreadConversationCount, resetUnreadNotificationCount,
  resetNewFriendRequestCountCount, incrementUnreadNotificationCount,
  incrementFriendRequestCount,
} from '../../../../redux/slices/userSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { signOut } from '../../../../utils/session-utils';
import { SocketContext } from '../../../../context/socket';
import { LG_MEDIA_BREAKPOINT, analyticsId, MAIN_CONTENT_ID } from '../../../../constants';
import LoadingIndicator from '../../../ui/LoadingIndicator';
import useGoogleAnalytics from '../../../../hooks/useGoogleAnalytics';
import SkipToMainContent from '../../sidebar-nav/SkipToMainContent';
import { setRemoteConstantsData } from '../../../../redux/slices/remoteConstantsSlice';
import { fetchRemoteConstants } from '../../../../api/remote-constants';

interface Props {
  children: React.ReactNode;
}

const StyledOffcanvas = styled(Offcanvas)`
  background-color: #171717;
  .btn-close {
    background-color: var(--bs-link-color);
  }
`;

const LeftSidebarWrapper = styled.div`
  width: 142px;
  height: calc(100vh - 93.75px);
  padding-bottom: 50px;
  position: sticky;
  top: 93.75px;
  overflow-y: overlay;
  padding: 2px 1rem 0 2px;
  overscroll-behavior: contain;

  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style { display: none; }
  scrollbar-width { display: none; }
  &:hover {
    ::-webkit-scrollbar { display: block; }
    -ms-overflow-style { display: block; }
    scrollbar-width { display: block; }
  }
`;

// This id links the offcanvas to the top navar toggle for accessibility.
const offcanvasId = 'offcanvas-sidebar-nav';
const desktopBreakPoint = 'lg';

function AuthenticatedPageWrapper({ children }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.user);
  const remoteConstantsData = useAppSelector((state) => state.remoteConstants);
  const { pathname } = useLocation();
  const socket = useContext(SocketContext);
  const token = Cookies.get('sessionToken');
  useGoogleAnalytics(analyticsId);

  const [show, setShow] = useState(false);
  const isDesktopResponsiveSize = useMediaQuery({ query: `(min-width: ${LG_MEDIA_BREAKPOINT})` });

  const showOffcanvasSidebar = () => setShow(true);
  const toggleOffCanvas = () => {
    setShow(!show);
  };

  useEffect(() => {
    if (!token) {
      navigate(`/app/sign-in?path=${pathname}`);
      return;
    }

    if (!remoteConstantsData.loaded) {
      fetchRemoteConstants().then((res) => {
        dispatch(setRemoteConstantsData(res.data));
      }).catch(() => {
        // eslint-disable-next-line no-console
        console.log('An unexpected error occurred while loading remote constants');
      });
    }

    if (userData.user.userName === '') {
      userInitialData().then((res) => {
        dispatch(setUserInitialData(res.data));
      }).catch((err) => {
        if (err.response.status === 401) {
          signOut();
        }
      });
    }
  }, [dispatch, navigate, pathname, userData.user.userName, remoteConstantsData.loaded, token]);

  useCallback(() => {
    dispatch(setUserInitialData(userData));
  }, [dispatch, userData]);

  const onNotificationReceivedHandler = useCallback(() => {
    dispatch(incrementUnreadNotificationCount());
  }, [dispatch]);
  const onFriendRequestReceivedHandler = useCallback(() => {
    dispatch(incrementFriendRequestCount());
  }, [dispatch]);

  const onClearNewNotificationCount = useCallback(() => {
    dispatch(resetUnreadNotificationCount());
  }, [dispatch]);

  const onClearNewFriendRequestCount = useCallback(() => {
    dispatch(resetNewFriendRequestCountCount());
  }, [dispatch]);

  const onUnreadConversationCountUpdate = useCallback((count: any) => {
    dispatch(handleUpdatedUnreadConversationCount(count.unreadConversationCount));
  }, [dispatch]);

  useEffect(() => {
    if (socket) {
      socket.on('notificationReceived', onNotificationReceivedHandler);
      socket.on('friendRequestReceived', onFriendRequestReceivedHandler);
      socket.on('unreadConversationCountUpdate', onUnreadConversationCountUpdate);
      socket.on('clearNewNotificationCount', onClearNewNotificationCount);
      socket.on('clearNewFriendRequestCount', onClearNewFriendRequestCount);
      return () => {
        socket.off('notificationReceived', onNotificationReceivedHandler);
        socket.off('friendRequestReceived', onFriendRequestReceivedHandler);
        socket.off('unreadMessageCountUpdate', onUnreadConversationCountUpdate);
        socket.off('clearNewNotificationCount', onClearNewNotificationCount);
        socket.off('clearNewFriendRequestCount', onClearNewFriendRequestCount);
      };
    }
    return () => { };
  }, [
    onNotificationReceivedHandler, onFriendRequestReceivedHandler,
    onUnreadConversationCountUpdate, onClearNewFriendRequestCount,
    onClearNewNotificationCount,
    socket]);

  if (!token || !userData.user) {
    return <LoadingIndicator />;
  }
  return (
    <div className="page-wrapper full">
      <SkipToMainContent />
      <AuthenticatedPageHeader
        userName={userData.user.userName}
        onToggleClick={showOffcanvasSidebar}
        offcanvasSidebarExpandBreakPoint={desktopBreakPoint}
        ariaToggleTargetId={offcanvasId}
      />
      <div className="w-100 px-lg-4 container-xxl">
        <div className="d-flex">
          {isDesktopResponsiveSize
            && (
              <div className={`d-${desktopBreakPoint}-block d-none`}>
                <LeftSidebarWrapper>
                  <SidebarNavContent />
                </LeftSidebarWrapper>
              </div>
            )}
          <main id={MAIN_CONTENT_ID} className="px-lg-2 flex-grow-1 min-width-0">
            {children}
          </main>
        </div>
      </div>
      {show && (
        <StyledOffcanvas
          id={offcanvasId}
          show={show && !isDesktopResponsiveSize}
          onHide={toggleOffCanvas}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <MobileOnlySidebarContent className="mb-3" onToggleCanvas={toggleOffCanvas} />
            <SidebarNavContent onToggleCanvas={toggleOffCanvas} />
          </Offcanvas.Body>
        </StyledOffcanvas>
      )}
    </div>
  );
}

export default AuthenticatedPageWrapper;
