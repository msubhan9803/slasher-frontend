import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import PassDeckDesktop from '../../../images/pass-deck-desktop.jpg';
import PassDeckMobile from '../../../images/pass-deck-mobile.jpg';
import DatingPageWrapper from '../components/DatingPageWrapper';
import TutorialHeader from './components/TutorialHeader';
import TutorialIcon from './components/TutorialIcon';
import TutorialPhotos from './components/TutorialPhotos';

const StyledNextButton = styled(RoundButton)`
  width: 13.067rem; 
  @media (max-width: 600px) {
    width: 100%;
  }
`;
function Undo() {
  return (
    <DatingPageWrapper>
      <div className="text-center p-3 mt-5 pt-5 mt-lg-0 pt-lg-3">
        <TutorialHeader />
        <TutorialPhotos desktopImage={PassDeckDesktop} mobileImage={PassDeckMobile} />
        <Row className="justify-content-center">
          <Col xs={8}>
            <TutorialIcon tutorialIcon={solid('rotate-left')} iconColor="#FF8A00" uniqueId="undo-icon" shadow="rgba(255, 138, 0, 0.6)" />
            <h2 className="h2 fw-bold mt-4">Undo</h2>
            <p className="fs-4">On a user’s profile, the undo icon is to go back to the last profile. This will undo a pass or like and allow you to change your mind.</p>
          </Col>
        </Row>
        <Link to="/dating/tutorial/undo" className="d-flex justify-content-center mt-3">
          <StyledNextButton variant="primary" className="fs-3">
            Next
          </StyledNextButton>
        </Link>
      </div>
    </DatingPageWrapper>
  );
}

export default Undo;
