import React from 'react';
import { Container } from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import UnauthenticatedPageFooter from './UnauthenticatedPageFooter';
import signInImage from '../../../../images/sign-in-background-desktop.jpg';
import HeaderLogo from '../../../ui/HeaderLogo';
import { LG_MEDIA_BREAKPOINT, analyticsId, MAIN_CONTENT_ID } from '../../../../constants';
import useGoogleAnalytics from '../../../../hooks/useGoogleAnalytics';
import SkipToMainContent from '../../sidebar-nav/SkipToMainContent';

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
    background-color: var(--bs-black);
    @media (min-width: ${LG_MEDIA_BREAKPOINT}) {
      background-image: url(${signInImage});
      background-size: cover;
    }
  `}
`;

function UnauthenticatedPageWrapper({
  children, hideTopLogo, hideFooter, valign,
}: Props) {
  useGoogleAnalytics(analyticsId);

  return (
    <div className="page-wrapper nonav">
      <SkipToMainContent />
      <header className="text-center text-md-start">
        <Container fluid="lg" className={`${hideTopLogo ? 'd-none' : ''}`}>
          <Link to="/">
            <HeaderLogo />
          </Link>
        </Container>
      </header>
      <StyledMain id={MAIN_CONTENT_ID} className={`d-flex align-items-${valign}`} hideTopLogo={hideTopLogo}>
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
