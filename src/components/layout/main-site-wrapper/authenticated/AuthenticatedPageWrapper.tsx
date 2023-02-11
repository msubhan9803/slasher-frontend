import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { Offcanvas } from 'react-bootstrap';
import { ScrollRestoration, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import SidebarNavContent from '../../sidebar-nav/SidebarNavContent';
import AuthenticatedPageHeader from './AuthenticatedPageHeader';
import MobileOnlySidebarContent from '../../sidebar-nav/MobileOnlySidebarContent';
import { userInitialData } from '../../../../api/users';
import { incrementUnreadNotificationCount, setUserInitialData, handleUpdatedUnreadMessageCount } from '../../../../redux/slices/userSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { signOut } from '../../../../utils/session-utils';
import { SocketContext } from '../../../../context/socket';
import { LG_MEDIA_BREAKPOINT, analyticsId } from '../../../../constants';
import LoadingIndicator from '../../../ui/LoadingIndicator';
import useGoogleAnalytics from '../../../../hooks/useGoogleAnalytics';

interface Props {
  children: React.ReactNode;
}

const StyledOffcanvas = styled(Offcanvas)`
  background-color: #171717;
  .btn-close {
    background-color: #fff;
  }
`;
interface Propse {
  height: number;
}

const LeftSidebarWrapper = styled.div<Propse>`
  width: 142px;
  height: calc(100vh - 125px);
  position: sticky;
  top: 125px;
  overflow-y: overlay;
  padding-right: 1rem;
  overscroll-behavior: contain;

  &::-webkit-scrollbar {
    display: ${(props) => (props.height ? 'block' : 'none')};
  }

  -ms-overflow-style: ${(props) => (props.height ? 'block' : 'none')};
  scrollbar-width: ${(props) => (props.height ? 'block' : 'none')};
`;

// This id links the offcanvas to the top navar toggle for accessibility.
const offcanvasId = 'offcanvas-sidebar-nav';
const desktopBreakPoint = 'lg';

function AuthenticatedPageWrapper({ children }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.user);
  const { pathname } = useLocation();
  const socket = useContext(SocketContext);
  const token = Cookies.get('sessionToken');
  useGoogleAnalytics(analyticsId);
  const [isScroll, setIsScroll] = useState<boolean>(false);

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

    if (userData.user.userName === '') {
      userInitialData().then((res) => {
        dispatch(setUserInitialData(res.data));
      }).catch((err) => {
        if (err.response.status === 401) {
          signOut();
        }
      });
    }
  }, [dispatch, navigate, pathname, userData.user.userName, token]);

  useCallback(() => {
    dispatch(setUserInitialData(userData));
  }, [dispatch, userData]);

  const onNotificationReceivedHandler = useCallback(() => {
    dispatch(incrementUnreadNotificationCount());
  }, [dispatch]);

  const onUnreadMessageCountUpdate = useCallback((count: any) => {
    dispatch(handleUpdatedUnreadMessageCount(count.unreadMessageCount));
  }, [dispatch]);

  useEffect(() => {
    if (socket) {
      socket.on('notificationReceived', onNotificationReceivedHandler);
      socket.on('unreadMessageCountUpdate', onUnreadMessageCountUpdate);
      return () => {
        socket.off('notificationReceived', onNotificationReceivedHandler);
        socket.off('unreadMessageCountUpdate', onUnreadMessageCountUpdate);
      };
    }
    return () => { };
  }, [onNotificationReceivedHandler, onUnreadMessageCountUpdate, socket]);

  if (!token || !userData.user) {
    return <LoadingIndicator />;
  }
  return (
    <div className="page-wrapper full">
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
                <LeftSidebarWrapper
                  height={isScroll ? 1 : 0}
                  onMouseEnter={() => setIsScroll(true)}
                  onMouseLeave={() => setIsScroll(false)}
                  onTouchStart={() => setIsScroll(true)}
                  onTouchEnd={() => setIsScroll(false)}
                >
                  <SidebarNavContent />
                </LeftSidebarWrapper>
              </div>
            )}
          <main className="px-lg-2 flex-grow-1 min-width-0">
            {children}
            <ScrollRestoration
              getKey={(location: any) => location.pathname}
            />
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
