import React from 'react';
import { Container, Image } from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import UnauthenticatedPageFooter from './UnauthenticatedPageFooter';
import slasherLogo from '../../../../images/slasher-logo-medium.png';
import signInImage from '../../../../images/sign-in-background-desktop.jpg';

interface Props {
  hideTopLogo?: boolean,
  hideFooter?: boolean,
  valign?: 'start' | 'center' | 'end',
  children: React.ReactNode;
}

const StyledMain = styled.main`
  flex: 1;
`;

const StyledLogoImage = styled(Image)`
  height: 6rem;
`;

const StyledDiv = styled.div<any>`
${({ hideTopLogo }) => hideTopLogo && `
@media (min-width: 768px) {
  background-image: url(${signInImage});
  background-size: cover;
}
`}
`;

function UnauthenticatedPageWrapper({
  children, hideTopLogo, hideFooter, valign,
}: Props) {
  return (
    <StyledDiv className="page-wrapper nonav" hideTopLogo={hideTopLogo}>
      <header className="text-center text-md-start">
        <Container fluid="lg" className={`${hideTopLogo ? 'd-none' : ''}`}>
          <Link to="/">
            <StyledLogoImage src={slasherLogo} />
          </Link>
        </Container>
      </header>
      <StyledMain className={`d-flex align-items-${valign}`}>
        <Container fluid={`${hideTopLogo ? 'fluid' : 'lg'}`}>
          {children}
        </Container>
      </StyledMain>
      {hideFooter || <UnauthenticatedPageFooter />}
    </StyledDiv>
  );
}

UnauthenticatedPageWrapper.defaultProps = {
  hideTopLogo: false,
  hideFooter: false,
  valign: 'center',
};

export default UnauthenticatedPageWrapper;
