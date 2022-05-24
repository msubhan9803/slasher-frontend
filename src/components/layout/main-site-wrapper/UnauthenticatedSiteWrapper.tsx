import React from 'react';
import { Container } from 'react-bootstrap';

interface Props {
  children: React.ReactNode;
}

function UnauthenticatedSiteWrapper({ children }: Props) {
  return (
    <Container>
      <main>
        {children}
      </main>
    </Container>
  );
}
export default UnauthenticatedSiteWrapper;
