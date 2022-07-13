import React from 'react';
import {
  Row,
} from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import DatingMenuSmallScreen from './DatingMenu/DatingMenuSmallScreen';

interface Props {
  children: React.ReactNode;
}

function DatingPageWrapper({ children }: Props) {
  return (
    <AuthenticatedPageWrapper rightSidebarType="dating">
      <Row className="mb-5 mb-sm-0">
        {children}
      </Row>
      <DatingMenuSmallScreen />
    </AuthenticatedPageWrapper>
  );
}

export default DatingPageWrapper;
