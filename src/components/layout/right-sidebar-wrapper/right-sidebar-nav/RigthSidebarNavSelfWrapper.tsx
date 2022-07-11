import React from 'react';
import {
  Col, Row,
} from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RightSidebarSelf from './RightSidebarSelf';

interface Props {
  children: React.ReactNode;
}

function AuthenticatedRigthSideNavSelfWrapper({ children }: Props) {
  return (
    <AuthenticatedPageWrapper>
      <Row className="mb-5 mb-sm-0">
        <Col md={9}>
          {children}
        </Col>
        <Col md={3} className="d-none d-md-block pe-4">
          <RightSidebarSelf />
        </Col>
      </Row>
    </AuthenticatedPageWrapper>
  );
}
export default AuthenticatedRigthSideNavSelfWrapper;
