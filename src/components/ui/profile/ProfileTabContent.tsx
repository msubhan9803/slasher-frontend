import React, { useRef } from 'react';
import styled from 'styled-components';
import { XL_MEDIA_BREAKPOINT, LG_MEDIA_BREAKPOINT } from '../../../constants';

interface Props {
  children: React.ReactNode;
}
interface ViewportProps {
  topheight: number;
}

const ViewportMinHeightContainer = styled.div<ViewportProps>`
  min-height: 78vh;
  @media (max-width: ${XL_MEDIA_BREAKPOINT}) {
      min-height: 83vh;
  }
  @media (max-width: ${LG_MEDIA_BREAKPOINT}) {
      min-height: 100vh;
  }
`;

function ProfileTabContent({ children }: Props) {
  const positionRef = useRef<HTMLDivElement>(null);
  return (
    <ViewportMinHeightContainer topheight={positionRef?.current?.offsetTop!} ref={positionRef}>
      {children}
    </ViewportMinHeightContainer>
  );
}

export default ProfileTabContent;
