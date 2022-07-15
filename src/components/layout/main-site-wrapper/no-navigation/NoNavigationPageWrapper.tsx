import React from 'react';
import { Container, Image } from 'react-bootstrap';
import styled from 'styled-components';
import slasherLogo from '../../../../images/slasher-logo-medium.png';

interface Props {
  hideTopLogo?: boolean,
  children: React.ReactNode;
  className?: string;
}

const StyledMain = styled.main`
  flex: 1;
`;

const StyledLogoImage = styled(Image)`
  height: 6rem;
`;

function NoNavigationPageWrapper({ children, hideTopLogo, className }: Props) {
  return (
    <>
      <header className="text-center text-md-start">
        <Container fluid="lg" className={`${hideTopLogo ? 'd-none' : ''}`}>
          <StyledLogoImage src={slasherLogo} />
        </Container>
      </header>
      <StyledMain className={`d-flex ${className}`}>
        <Container fluid="lg">
          {children}
        </Container>
      </StyledMain>
    </>
  );
}

NoNavigationPageWrapper.defaultProps = {
  hideTopLogo: false,
  className: '',
};

export default NoNavigationPageWrapper;
