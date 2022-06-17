import React from 'react';
import {
  Col, Container, Row,
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
      <Container>
        <Row className="mb-5">
          <Col md={8}>
            {children}
          </Col>
          {/* -----------------Start dating menu for large screen----------- */}
          <DatingMenuLargeScreen />
          {/* -----------------End dating menu for large screen----------- */}
        </Row>
        {/* ---------------Start dating menu for small screen--------------- */}
        <DatingMenuSmallScreen />
        {/* ---------------End dating menu for small screen--------------- */}

      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default DatingPageWrapper;
