import React from 'react';
import { Container, Image } from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import UnauthenticatedSiteFooter from './UnauthenticatedSiteFooter';
import slasherLogo from '../../../../images/slasher-logo.svg';

interface Props {
  hideTopLogo?: boolean,
  children: React.ReactNode;
}

const StyledMain = styled.main`
  flex: 1;
`;

function UnauthenticatedSiteWrapper({ children, hideTopLogo }: Props) {
  return (
    <>
      <header className="text-center text-md-start py-4">
        <Container className={`${hideTopLogo ? 'd-none' : ''}`}>
          <Link to="/">
            <Image src={slasherLogo} />
          </Link>
        </Container>
      </header>
      <StyledMain className="d-flex align-items-center">
        <Container>
          {children}
        </Container>
      </StyledMain>
      <UnauthenticatedSiteFooter />
    </>
  );
}

UnauthenticatedSiteWrapper.defaultProps = {
  hideTopLogo: false,
};

export default UnauthenticatedSiteWrapper;
