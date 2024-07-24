import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import SticyBannerAdSpaceCompensation from '../../../SticyBannerAdSpaceCompensation';
import { getGlobalCssProperty, removeGlobalCssProperty, setGlobalCssProperty } from '../../../../utils/styles-utils ';
import QuickLinks from '../../right-sidebar-wrapper/components/QuickLinks';

interface Props {
  children: React.ReactNode;
}

const StyledRightSidebarWrapper = styled.div`
  // width: calc(320px + 5px);
  width: 319px;
  height: calc(100vh - 93.75px);
  padding: 2px calc(1rem + var(--scroll-bar-width)) 75px .25rem;
  position: sticky;
  top: 93.75px;
  overflow-y: overlay;
  overscroll-behavior: contain;

  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style { display: none; }
  scrollbar-width { display: none; }
  &:hover {
    // padding-right: calc(1rem + var(--reset-padding-when-no-scroll-bar, 0px));
    // In above we remove (--scroll-bar-width) to account for the width of scrollbar sidebar is hovered.
    // Also, we add "--reset-padding-when-no-scroll-bar" so that when height is not enought and scrollbar
    // is not shown when hovered we must not change the padding, and we do that by setting same value for
    // "--reset-padding-when-no-scroll-bar" as that of "--scroll-bar-width".
    ::-webkit-scrollbar { display: block; }
    -ms-overflow-style { display: block; }
    scrollbar-width { display: block; }
  }
`;

function RightSidebarWrapper({ children }: Props) {
  const rightSidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rightSidebarRef.current) { return undefined; }

    const intervalTimer = setInterval(() => {
      const rightSidebarElement = rightSidebarRef.current!;
      const hasScrollBar = rightSidebarElement?.scrollHeight > rightSidebarElement?.clientHeight;
      if (hasScrollBar) {
        removeGlobalCssProperty('--reset-padding-when-no-scroll-bar');
      } else {
        const scrollBarWidth = getGlobalCssProperty('--scroll-bar-width');
        setGlobalCssProperty('--reset-padding-when-no-scroll-bar', scrollBarWidth);
      }
    }, 500);

    return () => clearTimeout(intervalTimer);
  }, []);
  return (
    <StyledRightSidebarWrapper
      className="d-none d-lg-block"
      ref={rightSidebarRef}
    >
      <QuickLinks />
      {children}
      <SticyBannerAdSpaceCompensation />

    </StyledRightSidebarWrapper>
  );
}

export default RightSidebarWrapper;
