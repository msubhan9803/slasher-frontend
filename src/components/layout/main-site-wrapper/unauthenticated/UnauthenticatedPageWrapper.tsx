import React from 'react';
import { Container, Image } from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import UnauthenticatedPageFooter from './UnauthenticatedPageFooter';
import slasherLogo from '../../../../images/slasher-logo-medium.png';

interface Props {
  hideTopLogo?: boolean,
  children: React.ReactNode;
}

const StyledMain = styled.main`
  flex: 1;
`;

const StyledLogoImage = styled(Image)`
  height: 6rem;
`;

function UnauthenticatedPageWrapper({ children, hideTopLogo }: Props) {
  return (
    <>
      <header className="text-center text-md-start pb-4">
        <Container fluid="lg" className={`${hideTopLogo ? 'd-none' : ''}`}>
          <Link to="/">
            <StyledLogoImage src={slasherLogo} />
          </Link>
        </Container>
      </header>
      <StyledMain className="d-flex align-items-center">
        <Container fluid="lg">
          {children}
        </Container>
      </StyledMain>
      <UnauthenticatedPageFooter />
    </>
  );
}

UnauthenticatedPageWrapper.defaultProps = {
  hideTopLogo: false,
};

export default UnauthenticatedPageWrapper;
