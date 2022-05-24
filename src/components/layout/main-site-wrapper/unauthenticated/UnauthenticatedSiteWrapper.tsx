import React from 'react';
import { Container } from 'react-bootstrap';
import UnauthenticatedSiteFooter from './UnauthenticatedSiteFooter';

interface Props {
  children: React.ReactNode;
}

function UnauthenticatedSiteWrapper({ children }: Props) {
  return (
    <>
      <Container className="pt-5">
        <main>
          {children}
        </main>
      </Container>
      <UnauthenticatedSiteFooter />
    </>
  );
}
export default UnauthenticatedSiteWrapper;
