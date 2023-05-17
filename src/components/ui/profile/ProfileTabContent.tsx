import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { userIsLoggedIn } from '../../../utils/session-utils';

interface Props {
  children: React.ReactNode;
}

const ViewportMinHeightContainer = styled.div`
  min-height: 100vh;
`;

function ProfileTabContent({ children }: Props) {
  const { userName } = useParams();
  const isLoggedIn = userIsLoggedIn();
  return (
    <div>
      {userName && !isLoggedIn ? children
        : <ViewportMinHeightContainer>{children}</ViewportMinHeightContainer>}
    </div>
  );
}

export default ProfileTabContent;
