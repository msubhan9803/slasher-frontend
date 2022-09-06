import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import TutorialUndoDesktop from '../../../images/tutorial-undo-desktop.png';
import TutorialUndoMobile from '../../../images/tutorial-undo-mobile.png';
import DatingPageWrapper from '../components/DatingPageWrapper';
import TutorialButtons from './components/TutorialButtons';
import TutorialHeader from './components/TutorialHeader';
import TutorialIcon from './components/TutorialIcon';
import TutorialPhotos from './components/TutorialPhotos';

function TutorialUndo() {
  return (
    <DatingPageWrapper>
      <div className="text-center p-3 mt-5 pt-5 mt-lg-0 pt-lg-3">
        <TutorialHeader />
        <TutorialPhotos desktopImage={TutorialUndoDesktop} mobileImage={TutorialUndoMobile} />
        <Row className="justify-content-center">
          <Col xs={8}>
            <TutorialIcon tutorialIcon={solid('rotate-left')} iconColor="#FF8A00" uniqueId="undo-icon" />
            <h2 className="h2 fw-bold mt-4">Undo</h2>
            <p className="fs-4">On a user’s profile, the undo icon is to go back to the last profile. This will undo a pass or like and allow you to change your mind.</p>
          </Col>
        </Row>
        <TutorialButtons nextLink="monster-like" />
      </div>
    </DatingPageWrapper>
  );
}

export default TutorialUndo;
