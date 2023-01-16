import React, { useContext, useEffect, useState } from 'react';
import {
  Container, Offcanvas,
} from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import SidebarNavContent from '../../sidebar-nav/SidebarNavContent';
import AuthenticatedPageHeader from './AuthenticatedPageHeader';
import MobileOnlySidebarContent from '../../sidebar-nav/MobileOnlySidebarContent';
import RightSidebarViewer from '../../right-sidebar-wrapper/right-sidebar-nav/RightSidebarViewer';
import RightSidebarSelf from '../../right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import DatingSidebar from '../../../../routes/dating/components/DatingMenu/DatingSidebar';
import NewsRightSideNav from '../../../../routes/news/components/NewsRightSideNav';
import ShoppingRightSidebar from '../../../../routes/shopping/ShoppingRightSidebar';
import BooksRigthSideNav from '../../../../routes/books/components/BooksRigthSideNav';
import MovieRightSideNav from '../../../../routes/movies/components/MovieRightSideNav';
import PlaceRightSidebar from '../../../../routes/places/PlaceRightSidebar';
import NotificationsRIghtSideNav from '../../../../routes/notifications/NotificationsRIghtSideNav';
import EventRightSidebar from '../../../../routes/events/EventRightSidebar';
import PodcastsSidebar from '../../../../routes/podcasts/components/PodcastsSidebar';
import { userInitialData } from '../../../../api/users';
import { incrementUnreadNotificationCount, setUserInitialData } from '../../../../redux/slices/userSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { clearSignInCookies } from '../../../../utils/session-utils';
import { SocketContext } from '../../../../context/socket';
import { LG_MEDIA_BREAKPOINT } from '../../../../constants';

interface Props {
  children: React.ReactNode;
  rightSidebarType?: 'profile-self' | 'profile-other-user' | 'dating' | 'movie' | 'book' | 'news' | 'shopping' | 'place' | 'notification' | 'event' | 'podcast';
}

const StyledOffcanvas = styled(Offcanvas)`
  background-color: #171717;
  .btn-close {
    background-color: #fff;
  }
`;

const LeftSidebarWrapper = styled.div`
  width: 127px;
`;

const MainContentCol = styled.main`
  // For mobile sizes, add bottom padding to account for persistent bottom nav buttons
  padding-bottom: 5.25em;

  // For desktop sizes, reduce bottom padding
  @media (min-width: ${LG_MEDIA_BREAKPOINT}) {
    padding-bottom: 1em;
  }
`;

const RightSidebarWrapper = styled.div`
  width: 334px;
`;

// This id links the offcanvas to the top navar toggle for accessibility.
const offcanvasId = 'offcanvas-sidebar-nav';
const desktopBreakPoint = 'lg';

function AuthenticatedPageWrapper({ children, rightSidebarType }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.user);
  const { pathname } = useLocation();
  const socket = useContext(SocketContext);

  useEffect(() => {
    const token = Cookies.get('sessionToken');
    if (!token) {
      navigate(`/sign-in?path=${pathname}`);
      return;
    }

    if (userData.user.userName === '') {
      userInitialData().then((res) => {
        dispatch(setUserInitialData(res.data));
      }).catch((err) => {
        if (err.response.status === 401) {
          clearSignInCookies();
          navigate('/sign-in');
        }
      });
    }
  }, []);

  const [show, setShow] = useState(false);
  const isDesktopResponsiveSize = useMediaQuery({ query: `(min-width: ${LG_MEDIA_BREAKPOINT})` });

  const hideOffcanvasSidebar = () => setShow(false);
  const showOffcanvasSidebar = () => setShow(true);

  const renderSidebarForType = (type: string) => ({
    'profile-self': <RightSidebarSelf />,
    'profile-other-user': <RightSidebarViewer />,
    dating: <DatingSidebar />,
    movie: <MovieRightSideNav />,
    news: <NewsRightSideNav />,
    shopping: <ShoppingRightSidebar />,
    book: <BooksRigthSideNav />,
    place: <PlaceRightSidebar />,
    notification: <NotificationsRIghtSideNav />,
    event: <EventRightSidebar />,
    podcast: <PodcastsSidebar />,
  }[type]);

  useEffect(() => {
    dispatch(setUserInitialData(userData));
  }, []);

  const onNotificationReceivedHandler = () => {
    dispatch(incrementUnreadNotificationCount());
  };

  useEffect(() => {
    if (socket) {
      socket.on('notificationReceived', onNotificationReceivedHandler);
      return () => {
        socket.off('notificationReceived', onNotificationReceivedHandler);
      };
    }
    return () => { };
  }, []);

  return (
    <div className="page-wrapper full">
      <AuthenticatedPageHeader
        userName={userData.user.userName}
        onToggleClick={showOffcanvasSidebar}
        offcanvasSidebarExpandBreakPoint={desktopBreakPoint}
        ariaToggleTargetId={offcanvasId}
      />
      <Container fluid="xxl" className="py-3 px-lg-4">
        <div className="d-flex">
          {isDesktopResponsiveSize
            && (
              <div className={`d-${desktopBreakPoint}-block d-none`}>
                <LeftSidebarWrapper>
                  <SidebarNavContent />
                </LeftSidebarWrapper>
              </div>
            )}
          <MainContentCol className="px-lg-3 flex-grow-1 min-width-0">
            {children}
          </MainContentCol>
          {
            rightSidebarType
            && (
              <div id="desktop-sidebar" className={`d-${desktopBreakPoint}-block d-none`}>
                <RightSidebarWrapper>
                  {renderSidebarForType(rightSidebarType)}
                </RightSidebarWrapper>
              </div>
            )
          }
        </div>
      </Container>
      {show && (
        <StyledOffcanvas
          id={offcanvasId}
          show={show && !isDesktopResponsiveSize}
          onHide={hideOffcanvasSidebar}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <MobileOnlySidebarContent className="mb-3" />
            <SidebarNavContent />
          </Offcanvas.Body>
        </StyledOffcanvas>
      )}
    </div>
  );
}

AuthenticatedPageWrapper.defaultProps = {
  rightSidebarType: null,
};

export default AuthenticatedPageWrapper;
