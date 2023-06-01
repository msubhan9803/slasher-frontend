import React from 'react';
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
}

const StyledRightSidebarWrapper = styled.div`
  width: calc(320px + 0.5rem);
  height: calc(100vh - 93.75px);
  padding: 2px 1rem 75px .25rem;
  position: sticky;
  top: 93.75px;
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
