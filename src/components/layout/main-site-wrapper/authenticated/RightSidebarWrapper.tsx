import React from 'react';
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
}

const StyledRightSidebarWrapper = styled.div`
  width: 319px;
  height: calc(100vh - 125px);
  padding-bottom: 75px;
  position: sticky;
  top: 125px;
  padding-right: 1rem;
  overflow-y: overlay;
  overscroll-behavior: contain;

  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style { display: none; }
  scrollbar-width { display: none; }
  &:hover {
    ::-webkit-scrollbar { display: block; }
    -ms-overflow-style { display: block; }
    scrollbar-width { display: block; }
  }
`;

function RightSidebarWrapper({ children }: Props) {
  return (
    <StyledRightSidebarWrapper
      className="d-none d-lg-block"
    >
      {children}
    </StyledRightSidebarWrapper>
  );
}

export default RightSidebarWrapper;
