import React from 'react';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import DatingMenuSmallScreen from './DatingMenu/DatingMenuSmallScreen';

interface Props {
  children: React.ReactNode;
}

const LG_BREAKPOINT_BOOTSTRAP = '992px';

const ResponsiveSpacer = styled.div`
  margin-top: 100px;
  @media (min-width: ${LG_BREAKPOINT_BOOTSTRAP}){
    margin-top: 0px;
  }
`;

function DatingPageWrapper({ children }: Props) {
  return (
    <AuthenticatedPageWrapper rightSidebarType="dating">
      <ResponsiveSpacer />
      {children}
      <DatingMenuSmallScreen />
    </AuthenticatedPageWrapper>
  );
}

export default DatingPageWrapper;
