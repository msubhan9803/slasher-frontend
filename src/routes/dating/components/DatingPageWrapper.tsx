import React from 'react';
import AuthenticatedSiteWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedSiteWrapper';

interface Props {
  children: React.ReactNode;
}

function DatingPageWrapper({ children }: Props) {
  return (
    <AuthenticatedSiteWrapper>
      {/* TODO: Add dating sidebar */}
      {children}
    </AuthenticatedSiteWrapper>
  );
}

export default DatingPageWrapper;
