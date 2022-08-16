import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import PassDeckDesktop from '../../../images/pass-deck-desktop.jpg';
import PassDeckMobile from '../../../images/pass-deck-mobile.jpg';
import DatingPageWrapper from '../components/DatingPageWrapper';

interface LinearIconProps {
  uniqueId?: string
}
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const StyledCancelIcon = styled.div`
  width: 5.334rem;
  height: 5.334rem;
  box-shadow: 0 0 0.571rem rgba(255, 24, 0, 0.7);
`;
const StyledDesktopImage = styled.div`
  aspect-ratio: 1.53;
`;
const StyledMobileImage = styled.div`
  aspect-ratio: 0.61;
`;
const StyledNextButton = styled(RoundButton)`
  width: 13.067rem; 
  @media (max-width: 600px) {
    width: 100%;
  }
`;
function PassDeck() {
  return (
    <DatingPageWrapper>
      <div className="text-center p-3 mt-5 pt-5 mt-lg-0 pt-lg-3">
        <h1 className="text-primary h2 fw-bold mt-2 mt-lg-0">Let’s get you ready!</h1>
        <p className="fs-4">Here’s everything you need to know.</p>
        <Row className="justify-content-center my-4">
          <Col sm={8} md={6} lg={11}>
            <StyledDesktopImage className="d-none d-lg-block rounded-3">
              <Image className="w-100 h-100 rounded-3" src={PassDeckDesktop} alt="Pass deck desktop" />
            </StyledDesktopImage>
            <StyledMobileImage className="d-block d-lg-none rounded-3 mx-5">
              <Image className="w-100 h-100 rounded-3" src={PassDeckMobile} alt="Pass deck desktop" />
            </StyledMobileImage>
          </Col>
        </Row>
        <StyledCancelIcon className="bg-white border border-primary d-flex justify-content-center align-items-center mx-auto rounded-circle">
          <LinearIcon uniqueId="cancel-icon">
            <FontAwesomeIcon icon={solid('times')} size="2x" />
          </LinearIcon>
          <svg width="0" height="0">
            <linearGradient id="cancel-icon" x1="00%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
              <stop offset="100%" style={{ stopColor: '#FF1800', stopOpacity: '0.6' }} />
            </linearGradient>
          </svg>
        </StyledCancelIcon>
        <h2 className="h2 fw-bold mt-4">Pass deck</h2>
        <p className="fs-4">On a user’s profile, the X icon is to pass and move on to the next profile.</p>
        <div className="d-flex justify-content-center mt-4 pt-2">
          <StyledNextButton variant="primary" className="fs-3">
            Next
          </StyledNextButton>
        </div>
      </div>
    </DatingPageWrapper>
  );
}

export default PassDeck;
