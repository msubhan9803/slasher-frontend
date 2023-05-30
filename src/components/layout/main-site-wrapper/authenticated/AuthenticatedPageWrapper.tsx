/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { Offcanvas } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import { io } from 'socket.io-client';
import SidebarNavContent from '../../sidebar-nav/SidebarNavContent';
import AuthenticatedPageHeader from './AuthenticatedPageHeader';
import MobileOnlySidebarContent from '../../sidebar-nav/MobileOnlySidebarContent';
import { userInitialData } from '../../../../api/users';
import {
  setUserInitialData, handleUpdatedUnreadConversationCount, resetUnreadNotificationCount,
  resetNewFriendRequestCountCount, incrementUnreadNotificationCount,
  incrementFriendRequestCount,
  appendToPathnameHistory,
} from '../../../../redux/slices/userSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { getSessionToken, signOut } from '../../../../utils/session-utils';
import {
  LG_MEDIA_BREAKPOINT, analyticsId, MAIN_CONTENT_ID, apiUrl,
} from '../../../../constants';
import useGoogleAnalytics from '../../../../hooks/useGoogleAnalytics';
import SkipToMainContent from '../../sidebar-nav/SkipToMainContent';
import { setRemoteConstantsData } from '../../../../redux/slices/remoteConstantsSlice';
import { fetchRemoteConstants } from '../../../../api/remote-constants';
import slasherLogo from '../../../../images/slasher-logo-medium.png';
import HeaderLogo from '../../../ui/HeaderLogo';
import { setSocketConnected } from '../../../../redux/slices/socketSlice';
import socketStore from '../../../../socketStore';
import useSessionTokenMonitorAsync from '../../../../hooks/useSessionTokenMonitorAsync';
import useSessionToken from '../../../../hooks/useSessionToken';

interface Props {
  children: React.ReactNode;
}

const StyledOffcanvas = styled(Offcanvas)`
  background-color: #171717;
`;

const LeftSidebarWrapper = styled.div`
  width: 147px;
  padding: .25rem 1rem 0 .25rem;
  height: calc(100vh - 93.75px);
  padding-bottom: 50px;
  position: sticky;
  top: 93.75px;
  overflow-y: overlay;
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
  const location = useLocation();
  const token = useSessionToken();
  const tokenNotFound = !token.isLoading && !token.value;

  useGoogleAnalytics(analyticsId);
  const params = useParams();

  // Record all navigation by user
  useEffect(() => {
    dispatch(appendToPathnameHistory(location.pathname));
  }, [dispatch, location.pathname]);

  // Reload the page if the session token changes
  useSessionTokenMonitorAsync(
    getSessionToken,
    () => { window.location.reload(); },
    5_000,
  );

  const [show, setShow] = useState(false);
  const isDesktopResponsiveSize = useMediaQuery({ query: `(min-width: ${LG_MEDIA_BREAKPOINT})` });
  const isConnectingSocketRef = useRef(false);
  const isSocketConnected = useAppSelector((state) => state.socket.isConnected);
  const { socket } = socketStore;

  const showOffcanvasSidebar = () => setShow(true);
  const toggleOffCanvas = () => {
    setShow(!show);
  };

  useEffect(() => {
    if (token.isLoading) { return; }

    // Redirect to public profile page
    if (tokenNotFound && params.userName && params['*']) {
      navigate(`/${params.userName}`);
      return;
    }
    // Redirect to login page
    if (tokenNotFound) {
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

    if (userData.user?.userName === '') {
      userInitialData().then((res) => {
        dispatch(setUserInitialData(res.data));
      }).catch((err) => {
        if (err.response.status === 401) {
          signOut();
        }
      });
    }
  }, [dispatch, navigate, pathname, userData.user?.userName,
    remoteConstantsData.loaded, token, tokenNotFound, params.userName, params]);

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
    if (isSocketConnected || isConnectingSocketRef.current
      || token.isLoading || tokenNotFound) { return; }
    isConnectingSocketRef.current = true;

    socketStore.socket = io(apiUrl!, {
      transports: ['websocket'],
      auth: { token: token.value },
    });
    socketStore.socket.on('connect', () => {
      dispatch(setSocketConnected());
    });
    // This is here to help with troubleshooting if there are ever any connection issues.
    // This will just prove whether or not authentication worked. If authentication fails,
    // the client is automatically disconnected.
    socketStore.socket.once('authSuccess', (payload) => {
      if (payload.success) {
        (socketStore.socket as any).slasherAuthSuccess = true;
      }
    });
  }, [dispatch, isSocketConnected, tokenNotFound, token]);

  useEffect(() => {
    if (!socket) { return () => { }; }

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
  }, [onClearNewFriendRequestCount, onClearNewNotificationCount, onFriendRequestReceivedHandler,
    onNotificationReceivedHandler, onUnreadConversationCountUpdate, socket]);

  if (token.isLoading || !userData.user?.id) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <HeaderLogo
          logo={slasherLogo}
          height="6.5rem"
        />
      </div>

    );
  }
  return (
    <div className="page-wrapper full">
      <SkipToMainContent />
      <AuthenticatedPageHeader
        userName={userData.user?.userName}
        onToggleClick={showOffcanvasSidebar}
        offcanvasSidebarExpandBreakPoint={desktopBreakPoint}
        ariaToggleTargetId={offcanvasId}
      />
      <div className="w-100 px-lg-4 pt-2 pt-lg-0 container-xxl">
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
