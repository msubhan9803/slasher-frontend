/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import {
  Button, Offcanvas,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import { io } from 'socket.io-client';
import { Capacitor } from '@capacitor/core';
import SidebarNavContent from '../../sidebar-nav/SidebarNavContent';
import AuthenticatedPageHeader from './AuthenticatedPageHeader';
import MobileOnlySidebarContent from '../../sidebar-nav/MobileOnlySidebarContent';
import { userInitialData } from '../../../../api/users';
import {
  setUserInitialData, handleUpdatedUnreadConversationCount, resetUnreadNotificationCount,
  incrementUnreadNotificationCount,
  incrementFriendRequestCount,
  appendToPathnameHistory,
  updateRecentMessage,
} from '../../../../redux/slices/userSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { clearUserSession, getSessionToken } from '../../../../utils/session-utils';
import {
  LG_MEDIA_BREAKPOINT, MAIN_CONTENT_ID, RETRY_CONNECTION_BUTTON_ID,
  AUTHENTICATED_PAGE_WRAPPER_ID,
  isNativePlatform,
} from '../../../../constants';
import SkipToMainContent from '../../sidebar-nav/SkipToMainContent';
import { setRemoteConstantsData } from '../../../../redux/slices/remoteConstantsSlice';
import { fetchRemoteConstants } from '../../../../api/remote-constants';
import slasherLogo from '../../../../images/slasher-logo-medium.png';
import HeaderLogo from '../../../ui/HeaderLogo';
import { setIsSocketConnected } from '../../../../redux/slices/socketSlice';
import socketStore from '../../../../socketStore';
import useSessionTokenMonitorAsync from '../../../../hooks/useSessionTokenMonitorAsync';
import useSessionToken from '../../../../hooks/useSessionToken';
import { setIsServerAvailable } from '../../../../redux/slices/serverAvailableSlice';
import { showBackButtonInIos } from '../../../../utils/url-utils';
import { onKeyboardClose, removeGlobalCssProperty, setGlobalCssProperty } from '../../../../utils/styles-utils ';
import { enableScrollOnWindow } from '../../../../utils/scrollFunctions';
import { apiUrl } from '../../../../env';
import { useShowSticyBannerAdDesktopOnly } from '../../../SticyBannerAdSpaceCompensation';
import TpdAd from '../../../ui/TpdAd';
import { tpdAdSlotIdBannerA } from '../../../../utils/tpd-ad-slot-ids';
import { setMobileInfiniteScrollParent } from '../../../../redux/slices/mobileAdSlice';

interface Props {
  children: React.ReactNode;
}

const StyledOffcanvas = styled(Offcanvas)`
  background-color: #171717;
`;

const LeftSidebarWrapper = styled.div`
  width: 147px;
  padding: .25rem calc(1rem + var(--scroll-bar-width)) 0 .25rem;
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
    padding-right: 1rem; // We remove (--scroll-bar-width) to account for the width of scrollbar sidebar is hovered.
    ::-webkit-scrollbar { display: block; }
    -ms-overflow-style { display: block; }
    scrollbar-width { display: block; }
  }
`;

const StyledAuthenticatedPageWrapper = styled.div`
  @media(max-width: 979px) {
    min-height: calc(100dvh - 120px);
    max-height: calc(100dvh - 120px);
    overflow: auto;
  }
`;

// This id links the offcanvas to the top navar toggle for accessibility.
const offcanvasId = 'offcanvas-sidebar-nav'; // *Do not chagne this as global.scss also consume this value.
const desktopBreakPoint = 'lg';

function AuthenticatedPageWrapper({ children }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.user);
  const remoteConstantsData = useAppSelector((state) => state.remoteConstants);
  const { pathname, search, hash } = useLocation();
  const location = useLocation();
  const token = useSessionToken();
  const tokenNotFound = !token.isLoading && !token.value;
  const [show, setShow] = useState(false);
  const isDesktopResponsiveSize = useMediaQuery({ query: `(min-width: ${LG_MEDIA_BREAKPOINT})` });
  const isConnectingSocketRef = useRef(false);
  const isSocketConnected = useAppSelector((state) => state.socket.isConnected);
  const { socket } = socketStore;
  const backButtonElementRef = useRef<HTMLDivElement>(null);
  const isIOS = Capacitor.getPlatform() === 'ios';
  const showUnreachableServerModalIfDisconnected = useCallback((e: MouseEvent) => {
    // If socket state is disconnected then show server-unavailable dialog.
    if (!isSocketConnected) {
      const clickedElementIsRetryConnectButton = (
        e.target as Element || null
      )?.id === RETRY_CONNECTION_BUTTON_ID;

      if (!clickedElementIsRetryConnectButton) {
        e.preventDefault();
        e.stopPropagation();
      }
      dispatch(setIsServerAvailable(false));
    }
  }, [dispatch, isSocketConnected]);
  const showSticyBannerAdDesktopOnly = useShowSticyBannerAdDesktopOnly();
  // eslint-disable-next-line no-console

  useEffect(() => {
    window.addEventListener('click', showUnreachableServerModalIfDisconnected, true);
    return () => window.removeEventListener('click', showUnreachableServerModalIfDisconnected, true);
  }, [showUnreachableServerModalIfDisconnected]);

  const previousPathRef = useRef<string>();
  useEffect(() => {
    const currentPath = pathname + search + hash;
    if (previousPathRef.current === currentPath) { return; }
    previousPathRef.current = currentPath;
    // Fix: Sometimes bottom-navbar is not shown after using
    // `comment-textinput` on post-details page
    onKeyboardClose();
    // Fix: Sometimes scroll is disabled on home page after image in zoomed
    // and used browser-back button to go back (SD-1404)
    enableScrollOnWindow();
  }, [hash, pathname, search]);

  const params = useParams();

  // Record all navigation by user
  useEffect(() => {
    dispatch(appendToPathnameHistory(location.pathname));
  }, [dispatch, location.pathname]);

  // Reload the page if the session token changes

  if (!isNativePlatform) {
    // NOTE: Below hook is not called unconditionally because `isNativePlatform` is a constant value
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSessionTokenMonitorAsync(
      getSessionToken,
      () => { window.location.reload(); },
      5_000,
    );
  }

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
          clearUserSession();
        }
      });
    }
  }, [dispatch, navigate, pathname, userData.user?.userName,
    remoteConstantsData.loaded, token, tokenNotFound, params.userName, params]);

  const onNotificationReceivedHandler = useCallback(() => {
    dispatch(incrementUnreadNotificationCount());
  }, [dispatch]);
  const onFriendRequestReceivedHandler = useCallback((data: any) => {
    dispatch(incrementFriendRequestCount(data));
  }, [dispatch]);

  const onClearNewNotificationCount = useCallback(() => {
    dispatch(resetUnreadNotificationCount());
  }, [dispatch]);

  const onUnreadConversationCountUpdate = useCallback((count: any) => {
    dispatch(handleUpdatedUnreadConversationCount(count.unreadConversationCount));
  }, [dispatch]);

  const onChatMessageReceivedHandler = useCallback((message: any) => {
    dispatch(updateRecentMessage(message));
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
      dispatch(setIsSocketConnected(true));
      dispatch(setIsServerAvailable(true));
    });
    socketStore.socket.on('connect_error', (err: any) => {
      const isConnectionFailure = err.message === 'websocket error';
      if (isConnectionFailure) { dispatch(setIsSocketConnected(false)); }
    });
    socketStore.socket.on('disconnect', (err) => {
      const isConnectionLost = err === 'transport close';
      if (isConnectionLost) { dispatch(setIsSocketConnected(false)); }
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
    socket.on('friendRequestUpdated', onFriendRequestReceivedHandler);
    socket.on('unreadConversationCountUpdate', onUnreadConversationCountUpdate);
    socket.on('clearNewNotificationCount', onClearNewNotificationCount);
    socket.on('chatMessageReceived', onChatMessageReceivedHandler);
    return () => {
      socket.off('notificationReceived', onNotificationReceivedHandler);
      socket.off('friendRequestUpdated', onFriendRequestReceivedHandler);
      socket.off('unreadMessageCountUpdate', onUnreadConversationCountUpdate);
      socket.off('clearNewNotificationCount', onClearNewNotificationCount);
      socket.off('chatMessageReceived', onChatMessageReceivedHandler);
    };
  }, [onClearNewNotificationCount, onFriendRequestReceivedHandler,
    onNotificationReceivedHandler, onUnreadConversationCountUpdate, socket,
    onChatMessageReceivedHandler]);

  if (token.isLoading || !userData.user?.id) {
    return (
      <div className={`d-flex justify-content-center align-items-center ${isNativePlatform && 'd-none'}`} style={{ height: '100vh' }}>
        <HeaderLogo
          logo={slasherLogo}
          height="6.5rem"
        />
      </div>

    );
  }

  if (isIOS && showBackButtonInIos(location.pathname)) {
    setGlobalCssProperty('--heightOfBackButtonOfIos', `${backButtonElementRef.current?.clientHeight}px`);
  } else {
    removeGlobalCssProperty('--heightOfBackButtonOfIos');
  }

  const navigateBack = () => {
    if (window.history.back() === undefined) {
      navigate('/app/home', { replace: true });
    } else {
      navigate(-1);
    }
  };

  const setInfiniteScrollRef = (ref: any) => {
    dispatch(setMobileInfiniteScrollParent(ref));
  };

  return (
    <div id={AUTHENTICATED_PAGE_WRAPPER_ID} className="page-wrapper full" style={{ paddingTop: `${!isDesktopResponsiveSize && isIOS && showBackButtonInIos(location.pathname) ? 'var(--heightOfBackButtonOfIos)' : ''}` }}>
      {isIOS
        && showBackButtonInIos(location.pathname)
        && (
          <div className="pt-2 position-fixed" ref={backButtonElementRef} style={{ top: 0, paddingTop: '0.625rem', zIndex: 1 }}>
            <div className="ms-2">
              <Button variant="link" className="p-0 px-1" onClick={() => navigateBack()}>
                <FontAwesomeIcon role="button" icon={solid('arrow-left-long')} size="2x" />
              </Button>
            </div>
          </div>
        )}
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

      {/* Show `sticky-bottom-ad` on desktop (not show on mobile/tablet) */}
      {showSticyBannerAdDesktopOnly
        && (
          <TpdAd
            className="position-fixed bottom-0 w-100"
            style={{ height: 'auto' }}
            slotId={tpdAdSlotIdBannerA}
            id="bottom-ad"
            showSponsoredText={false}
          />
        )}

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
