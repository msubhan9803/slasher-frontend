import React from 'react';
import styled from 'styled-components';
import DatingMenuSmallScreen from './DatingMenu/DatingMenuSmallScreen';
import { LG_MEDIA_BREAKPOINT } from '../../../constants';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import DatingSidebar from './DatingMenu/DatingSidebar';

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
    <ContentSidbarWrapper>
      <ContentPageWrapper className="container">
        <ResponsiveSpacer />
        {children}
        <DatingMenuSmallScreen />
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <DatingSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default DatingPageWrapper;
