import React from 'react';
import { Container } from 'react-bootstrap';
import UnauthenticatedSiteFooter from './UnauthenticatedSiteFooter';

interface Props {
  children: React.ReactNode;
}

function UnauthenticatedSiteWrapper({ children }: Props) {
  return (
    <>
      <div className="pt-5 pb-4">
        <main>
          {children}
        </main>
      </div>
      <UnauthenticatedSiteFooter />
    </>
  );
}
export default UnauthenticatedSiteWrapper;
