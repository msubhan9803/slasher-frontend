import React from 'react';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import DatingMenuSmallScreen from './DatingMenu/DatingMenuSmallScreen';
import { LG_MEDIA_BREAKPOINT } from '../../../constants';

interface Props {
  children: React.ReactNode;
}

const ResponsiveSpacer = styled.div`
  margin-top: 100px;
  @media (min-width: ${LG_MEDIA_BREAKPOINT}){
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
