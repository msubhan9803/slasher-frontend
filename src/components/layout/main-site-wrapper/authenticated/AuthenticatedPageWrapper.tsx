import React, { useState } from 'react';
import {
  Container, Offcanvas,
} from 'react-bootstrap';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import SidebarNavContent from '../../sidebar-nav/SidebarNavContent';
import AuthenticatedPageHeader from './AuthenticatedPageHeader';
import MobileOnlySidebarContent from '../../sidebar-nav/MobileOnlySidebarContent';
import RightSidebarViewer from '../../right-sidebar-wrapper/right-sidebar-nav/RightSidebarViewer';
import RightSidebarSelf from '../../right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import DatingSidebar from '../../../../routes/dating/components/DatingMenu/DatingSidebar';
import MovieSidebar from '../../../../routes/movies/components/MovieSidebar';
import NewsRightSideNav from '../../../../routes/news/components/NewsRightSideNav';
import BooksRigthSideNav from '../../../../routes/books/BooksRigthSideNav';

interface Props {
  children: React.ReactNode;
  rightSidebarType?: 'profile-self' | 'profile-other-user' | 'dating' | 'movie' | 'book' | 'news';
}

const StyledOffcanvas = styled(Offcanvas)`
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
  @media (min-width: 992px) {
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
  const [show, setShow] = useState(false);
  const forceHideOffcanvasSidebar = useMediaQuery({ query: '(min-width: 992px)' });

  const hideOffcanvasSidebar = () => setShow(false);
  const showOffcanvasSidebar = () => setShow(true);

  const renderSidebarForType = (type: string) => ({
    'profile-self': <RightSidebarSelf />,
    'profile-other-user': <RightSidebarViewer />,
    dating: <DatingSidebar />,
    movie: <MovieSidebar />,
    news: <NewsRightSideNav />,
    book: <BooksRigthSideNav />,
  }[type]);

  return (
    <>
      <AuthenticatedPageHeader
        onToggleClick={showOffcanvasSidebar}
        offcanvasSidebarExpandBreakPoint={desktopBreakPoint}
        ariaToggleTargetId={offcanvasId}
      />
      <Container fluid="xxl" className="py-3 px-lg-4">
        <div className="d-flex">
          <div className={`d-${desktopBreakPoint}-block d-none`}>
            <LeftSidebarWrapper>
              <SidebarNavContent />
            </LeftSidebarWrapper>
          </div>
          <MainContentCol className="px-lg-3 flex-grow-1 min-width-0">
            {children}
          </MainContentCol>
          {
            rightSidebarType
            && (
              <div>
                <RightSidebarWrapper className={`d-${desktopBreakPoint}-block d-none`}>
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
          show={show && !forceHideOffcanvasSidebar}
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

    </>
  );
}

AuthenticatedPageWrapper.defaultProps = {
  rightSidebarType: null,
};

export default AuthenticatedPageWrapper;
