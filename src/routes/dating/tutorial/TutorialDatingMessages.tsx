import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import DatingPageWrapper from '../components/DatingPageWrapper';
import TutorialButtons from './components/TutorialButtons';
import TutorialHeader from './components/TutorialHeader';
import TutorialIcon from './components/TutorialIcon';
import TutorialPhotos from './components/TutorialPhotos';
import DatingMessagesDesktop from '../../../images/dating-messages-desktop.png';
import DatingMessagesMobile from '../../../images/dating-messages-mobile.png';

function TutorialDatingMessages() {
  return (
    <DatingPageWrapper>
      <div className="text-center p-3 mt-5 pt-5 mt-lg-0 pt-lg-3">
        <TutorialHeader />
        <TutorialPhotos desktopImage={DatingMessagesDesktop} mobileImage={DatingMessagesMobile} />
        <Row className="justify-content-center">
          <Col xs={8}>
            <TutorialIcon tutorialIcon={regular('comments')} iconColor="#FF1800" uniqueId="dating-messages" />
            <h2 className="h2 fw-bold mt-4">Dating messages</h2>
            <p className="fs-4">
              In the Dating Menu, the messages icon will allow
              you to go to your inbox and view your messages.
            </p>
          </Col>
        </Row>
        <TutorialButtons nextLink="dating-likes" />
      </div>
    </DatingPageWrapper>
  );
}

export default TutorialDatingMessages;
