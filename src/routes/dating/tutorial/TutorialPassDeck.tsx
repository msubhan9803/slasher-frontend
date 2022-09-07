import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import PassDeckDesktop from '../../../images/pass-deck-desktop.png';
import PassDeckMobile from '../../../images/pass-deck-mobile.png';
import DatingPageWrapper from '../components/DatingPageWrapper';
import TutorialButtons from './components/TutorialButtons';
import TutorialHeader from './components/TutorialHeader';
import TutorialIcon from './components/TutorialIcon';
import TutorialPhotos from './components/TutorialPhotos';

function TutorialPassDeck() {
  return (
    <DatingPageWrapper>
      <div className="text-center p-3 mt-5 pt-5 mt-lg-0 pt-lg-3">
        <TutorialHeader />
        <TutorialPhotos desktopImage={PassDeckDesktop} mobileImage={PassDeckMobile} />
        <Row className="justify-content-center">
          <Col xs={8}>
            <TutorialIcon tutorialIcon={solid('times')} iconColor="#FF1800" uniqueId="cancel-icon" />
            <h2 className="h2 fw-bold mt-4">Pass deck</h2>
            <p className="fs-4">On a user’s profile, the X icon is to pass and move on to the next profile.</p>
          </Col>
        </Row>
        <TutorialButtons nextLink="undo" />
      </div>
    </DatingPageWrapper>
  );
}

export default TutorialPassDeck;
