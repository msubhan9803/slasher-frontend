import React, { useState } from 'react';
import {
  Col, Offcanvas, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import SidebarNavContent from '../../sidebar-nav/SidebarNavContent';
import AuthenticatedPageHeader from './AuthenticatedPageHeader';

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

function AuthenticatedPageWrapper({ children }: Props) {
  const [show, setShow] = useState(false);
  const forceHideOffcanvasSidebar = useMediaQuery({ query: '(min-width: 768px)' });

  const hideOffcanvasSidebar = () => setShow(false);
  const showOffcanvasSidebar = () => setShow(true);

  return (
    <>
      <AuthenticatedPageHeader onToggleClick={showOffcanvasSidebar} offcanvasSidebarExpandBreakPoint="md" ariaToggleTargetId={offcanvasId} />
      <div className="py-3 mx-md-5">
        <Row>
          <Col md={3} lg={2} className="d-none d-md-block">
            <SidebarNavContent />
          </Col>
          <Col>
            <main>
              {children}
            </main>
          </Col>
        </Row>
      </div>
      <StyledOffcanvas
        id={offcanvasId}
        show={show && !forceHideOffcanvasSidebar}
        onHide={hideOffcanvasSidebar}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SidebarNavContent />
        </Offcanvas.Body>
      </StyledOffcanvas>
    </>
  );
}
export default AuthenticatedPageWrapper;
