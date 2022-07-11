import React from 'react';
import {
  Col, Row,
} from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RightSidebarViewer from './RightSidebarViewer';

interface Props {
  children: React.ReactNode;
}

function AuthenticatedRigthSideNavViewerWrapper({ children }: Props) {
  return (
    <AuthenticatedPageWrapper>
      <Row className="mb-5 mb-sm-0">
        <Col md={9}>
          {children}
        </Col>
        <Col md={3} className="d-none d-md-block pe-4">
          <RightSidebarViewer />
        </Col>
      </Row>
    </AuthenticatedPageWrapper>
  );
}
export default AuthenticatedRigthSideNavViewerWrapper;
