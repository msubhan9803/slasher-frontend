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
import SafeAreaIosTop from '../../../ui/SafeAreaIosTop';
import SafeAreaIosBottom from '../../../ui/SafeAreaIosBottom';

interface Props {
  hideTopLogo?: boolean,
  hideFooter?: boolean,
  valign?: 'start' | 'center' | 'end',
  children: React.ReactNode,
  isSignIn?: boolean;
}

interface StyledMainProps {
  hideTopLogo?: boolean,
  isSignIn?: boolean
}

const StyledMain = styled.main<StyledMainProps>`
  flex: 1;

  ${(props: StyledMainProps) => props.hideTopLogo && props.isSignIn && `
    background-color: var(--bs-black);
    @media (min-width: ${LG_MEDIA_BREAKPOINT}) {
      background-image: url(${signInImage});
      background-size: cover;
    }
  `}
`;

function UnauthenticatedPageWrapper({
  children, hideTopLogo, hideFooter, valign, isSignIn,
}: Props) {
  useGoogleAnalytics(analyticsId);

  return (
    <>
      <SafeAreaIosTop />
      <div className="page-wrapper nonav">
        <SkipToMainContent />
        <header className="text-center text-md-start">
          <Container fluid="lg" className={`${hideTopLogo ? 'd-none' : ''}`}>
            <Link to="/">
              <HeaderLogo />
            </Link>
          </Container>
        </header>
        <StyledMain id={MAIN_CONTENT_ID} className={`d-flex align-items-${valign}`} hideTopLogo={hideTopLogo} isSignIn={isSignIn}>
          <Container fluid={`${hideTopLogo ? 'fluid' : 'lg'}`}>
            {children}
          </Container>
        </StyledMain>
        {hideFooter || <UnauthenticatedPageFooter />}
      </div>
      <SafeAreaIosBottom />
    </>
  );
}

UnauthenticatedPageWrapper.defaultProps = {
  hideTopLogo: false,
  hideFooter: false,
  valign: 'center',
  isSignIn: false,
};

export default UnauthenticatedPageWrapper;
