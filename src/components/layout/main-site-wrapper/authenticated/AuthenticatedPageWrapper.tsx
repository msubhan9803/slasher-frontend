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
import DatingMenuLargeScreen from '../../../../routes/dating/components/DatingMenu/DatingMenuLargeScreen';

interface Props {
  children: React.ReactNode;
  rightSidebarType?: 'profile-self' | 'profile-other-user' | 'dating';
}

const StyledOffcanvas = styled(Offcanvas)`
  .btn-close {
    background-color: #fff;
  }
`;

const LeftSidebarCol = styled.div`
  flex-basis: 131px;
  @media (max-width: 1199px) {
    // flex-basis: 45px;
    // max-width: 45px;
    // overflow: hidden;
    // padding:0;
  }
`;

const MainContentCol = styled.main`
  flex: 1 0;
`;

const RightSidebarCol = styled.div`
  flex-basis: 334px;
  padding:0;
`;

// This id links the offcanvas to the top navar toggle for accessibility.
const offcanvasId = 'offcanvas-sidebar-nav';
const desktopBreakPoint = 'lg';

function AuthenticatedPageWrapper({ children, rightSidebarType }: Props) {
  const [show, setShow] = useState(false);
  const forceHideOffcanvasSidebar = useMediaQuery({ query: '(min-width: 768px)' });

  const hideOffcanvasSidebar = () => setShow(false);
  const showOffcanvasSidebar = () => setShow(true);

  const renderSidebarForType = (type: string) => ({
    'profile-self': <RightSidebarSelf />,
    'profile-other-user': <RightSidebarViewer />,
    dating: <DatingMenuLargeScreen />,
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
          <LeftSidebarCol className={`d-${desktopBreakPoint}-block d-none`}>
            <SidebarNavContent />
          </LeftSidebarCol>
          <MainContentCol className="px-lg-4">
            {children}
          </MainContentCol>
          {
            rightSidebarType
            && (
              <RightSidebarCol className={`d-${desktopBreakPoint}-block d-none`}>
                {renderSidebarForType(rightSidebarType)}
              </RightSidebarCol>
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
