import React, { useState } from 'react';
import {
  Col, Container, Offcanvas, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import SidebarNavContent from '../../sidebar-nav/SidebarNavContent';
import AuthenticatedPageHeader from './AuthenticatedPageHeader';
import MobileOnlySidebarContent from '../../sidebar-nav/MobileOnlySidebarContent';

interface Props {
  children: React.ReactNode;
}

const StyledOffcanvas = styled(Offcanvas)`
  .btn-close {
    background-color: #fff;
  }
`;

const LeftSidebarNavCol = styled.div`
  flex-basis: 10em;
`;

// This id links the offcanvas to the top navar toggle for accessibility.
const offcanvasId = 'offcanvas-sidebar-nav';

function AuthenticatedPageWrapper({ children }: Props) {
  const [show, setShow] = useState(false);
  const forceHideOffcanvasSidebar = useMediaQuery({ query: '(min-width: 768px)' });

  const hideOffcanvasSidebar = () => setShow(false);
  const showOffcanvasSidebar = () => setShow(true);

  return (
    <>
      <AuthenticatedPageHeader onToggleClick={showOffcanvasSidebar} offcanvasSidebarExpandBreakPoint="md" ariaToggleTargetId={offcanvasId} />
      <Container fluid="xxl" className="py-3">
        <Row>
          <LeftSidebarNavCol className="d-md-block d-none">
            <SidebarNavContent />
          </LeftSidebarNavCol>
          <Col>
            <main>
              {children}
            </main>
          </Col>
        </Row>
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
export default AuthenticatedPageWrapper;
