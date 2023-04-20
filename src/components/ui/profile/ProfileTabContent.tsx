import React from 'react';
import styled from 'styled-components';

interface Props {
  children: React.ReactNode;
}

const ViewportMinHeightContainer = styled.div`
  min-height: 100vh;
`;

function ProfileTabContent({ children }: Props) {
  return (
    <ViewportMinHeightContainer>{children}</ViewportMinHeightContainer>
  );
}

export default ProfileTabContent;
