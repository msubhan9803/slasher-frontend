import React, { useState } from 'react';
import {
  Col, Container, Offcanvas, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import AuthenticatedSiteHeader from './AuthenticatedSiteHeader';
import SidebarNavContent from '../../sidebar-nav/SidebarNavContent';

interface Props {
  children: React.ReactNode;
}

const StyledOffcanvas = styled(Offcanvas)`
  .btn-close {
    background-color: #fff;
  }
`;

// This id links the offcanvas to the top navar toggle for accessibility.
const offcanvasId = 'offcanvas-sidebar-nav';

function AuthenticatedSiteWrapper({ children }: Props) {
  const [show, setShow] = useState(false);
  const forceHideOffcanvasSidebar = useMediaQuery({ query: '(min-width: 768px)' });

  const hideOffcanvasSidebar = () => setShow(false);
  const showOffcanvasSidebar = () => setShow(true);

  return (
    <>
      <AuthenticatedSiteHeader onToggleClick={showOffcanvasSidebar} offcanvasSidebarExpandBreakPoint="md" ariaToggleTargetId={offcanvasId} />
      <Container className="py-3">
        <Row>
          <Col xs={3} className="d-none d-md-block">
            <SidebarNavContent />
          </Col>
          <Col>
            <main>
              {children}
            </main>
          </Col>
        </Row>
      </Container>
      <StyledOffcanvas
        id={offcanvasId}
        show={show && !forceHideOffcanvasSidebar}
        onHide={hideOffcanvasSidebar}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Offcanvas</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SidebarNavContent />
        </Offcanvas.Body>
      </StyledOffcanvas>
    </>
  );
}
export default AuthenticatedSiteWrapper;
