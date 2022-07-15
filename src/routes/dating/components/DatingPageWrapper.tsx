import React from 'react';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import DatingMenuSmallScreen from './DatingMenu/DatingMenuSmallScreen';

interface Props {
  children: React.ReactNode;
}

function DatingPageWrapper({ children }: Props) {
  return (
    <AuthenticatedPageWrapper rightSidebarType="dating">
      {children}
      <DatingMenuSmallScreen />
    </AuthenticatedPageWrapper>
  );
}

export default DatingPageWrapper;
