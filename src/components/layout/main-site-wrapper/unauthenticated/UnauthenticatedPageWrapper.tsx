import React from 'react';
import { Container, Image } from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import UnauthenticatedPageFooter from './UnauthenticatedPageFooter';
import slasherLogo from '../../../../images/slasher-logo-medium.png';
import signInImage from '../../../../images/sign-in-background-desktop.jpg';
import { LG_MEDIA_BREAKPOINT } from '../../../../constants';

interface Props {
  hideTopLogo?: boolean,
  hideFooter?: boolean,
  valign?: 'start' | 'center' | 'end',
  children: React.ReactNode;
}

interface StyledMainProps {
  hideTopLogo?: boolean
}

const StyledMain = styled.main<StyledMainProps>`
  flex: 1;

  ${(props: StyledMainProps) => props.hideTopLogo && `
    background-color: #000;
    @media (min-width: ${LG_MEDIA_BREAKPOINT}) {
      background-image: url(${signInImage});
      background-size: cover;
    }
  `}
`;

const StyledLogoImage = styled(Image)`
  height: 6rem;
`;
function UnauthenticatedPageWrapper({
  children, hideTopLogo, hideFooter, valign,
}: Props) {
  return (
    <div className="page-wrapper nonav">
      <header className="text-center text-md-start">
        <Container fluid="lg" className={`${hideTopLogo ? 'd-none' : ''}`}>
          <Link to="/">
            <StyledLogoImage src={slasherLogo} alt="Slasher logo" />
          </Link>
        </Container>
      </header>
      <StyledMain className={`d-flex align-items-${valign}`} hideTopLogo={hideTopLogo}>
        <Container fluid={`${hideTopLogo ? 'fluid' : 'lg'}`}>
          {children}
        </Container>
      </StyledMain>
      {hideFooter || <UnauthenticatedPageFooter />}
    </div>
  );
}

UnauthenticatedPageWrapper.defaultProps = {
  hideTopLogo: false,
  hideFooter: false,
  valign: 'center',
};

export default UnauthenticatedPageWrapper;
