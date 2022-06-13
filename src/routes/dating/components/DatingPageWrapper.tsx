import React from 'react';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';

interface Props {
  children: React.ReactNode;
}

function DatingPageWrapper({ children }: Props) {
  return (
    <AuthenticatedPageWrapper>
      {/* TODO: Add dating sidebar */}
      {children}
    </AuthenticatedPageWrapper>
  );
}

export default DatingPageWrapper;
