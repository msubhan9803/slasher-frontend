import React from 'react';
import {
  Col, Row,
} from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import DatingMenuLargeScreen from './DatingMenu/DatingMenuLargeScreen';
import DatingMenuSmallScreen from './DatingMenu/DatingMenuSmallScreen';

interface Props {
  children: React.ReactNode;
}

function DatingPageWrapper({ children }: Props) {
  return (
    <AuthenticatedPageWrapper>
      <Row className="mb-5 mb-sm-0">
        <Col md={8}>
          {children}
        </Col>
        <Col md={4} className="d-none d-md-block">
          <DatingMenuLargeScreen />
        </Col>
      </Row>
      <DatingMenuSmallScreen />
    </AuthenticatedPageWrapper>
  );
}

export default DatingPageWrapper;
