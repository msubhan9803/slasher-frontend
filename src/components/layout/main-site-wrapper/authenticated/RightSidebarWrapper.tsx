import React, { useState } from 'react';
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
}

interface StyledRighhtSideBar {
  height: number;
}
const StyledRightSidebarWrapper = styled.div<StyledRighhtSideBar>`
  padding-bottom: 1em;
  width: 319px;
  height: calc(100vh - 125px);
  position: sticky;
  top: 125px;
  padding-right: 1rem;
  overflow-y: overlay;
  overscroll-behavior: contain;

  &::-webkit-scrollbar {
    display: ${(props) => (props.height ? 'block' : 'none')};
  }

  -ms-overflow-style: ${(props) => (props.height ? 'block' : 'none')};
  scrollbar-width: ${(props) => (props.height ? 'block' : 'none')};
`;

function RightSidebarWrapper({ children }: Props) {
  const [isScroll, setIsScroll] = useState<boolean>(false);

  return (
    <StyledRightSidebarWrapper
      className="d-none d-lg-block"
      height={isScroll ? 1 : 0}
      onMouseEnter={() => setIsScroll(true)}
      onMouseLeave={() => setIsScroll(false)}
      onTouchStart={() => setIsScroll(true)}
      onTouchEnd={() => setIsScroll(false)}
    >
      {children}
    </StyledRightSidebarWrapper>
  );
}

export default RightSidebarWrapper;
