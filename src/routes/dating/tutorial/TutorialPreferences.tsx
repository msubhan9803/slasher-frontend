import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import DatingPageWrapper from '../components/DatingPageWrapper';
import TutorialHeader from './components/TutorialHeader';
import TutorialIcon from './components/TutorialIcon';
import TutorialPhotos from './components/TutorialPhotos';
import PreferencesDesktop from '../../../images/preferences-desktop.png';
import PreferencesMobile from '../../../images/preferences-mobile.png';
import TutorialButtons from './components/TutorialButtons';

function TutorialPreferences() {
  return (
    <DatingPageWrapper>
      <div className="text-center p-3 mt-5 pt-5 mt-lg-0 pt-lg-3">
        <TutorialHeader />
        <TutorialPhotos desktopImage={PreferencesDesktop} mobileImage={PreferencesMobile} />
        <Row className="justify-content-center">
          <Col xs={8}>
            <TutorialIcon tutorialIcon={solid('sliders')} iconColor="#FF1800" uniqueId="preferences" />
            <h2 className="h2 fw-bold mt-4">Preferences</h2>
            <p className="fs-4">
              In the Dating Menu, the Preferences icon will allow you to
              view and edit your preferences.
            </p>
          </Col>
        </Row>
        <TutorialButtons nextLink="profile" />
      </div>
    </DatingPageWrapper>
  );
}

export default TutorialPreferences;
