import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import useSessionToken from '../../../hooks/useSessionToken';

interface Props {
  children: React.ReactNode;
}

const ViewportMinHeightContainer = styled.div`
  min-height:78vh;
`;

function ProfileTabContent({ children }: Props) {
  const { userName } = useParams();
  const token = useSessionToken();
  const userIsLoggedIn = !token.isLoading && token.value;

  if (token.isLoading) { return null; }

  return (
    <div>
      {userName && !userIsLoggedIn ? children
        : <ViewportMinHeightContainer>{children}</ViewportMinHeightContainer>}
    </div>
  );
}

export default ProfileTabContent;
