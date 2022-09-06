import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import DatingPageWrapper from '../components/DatingPageWrapper';
import TutorialButtons from './components/TutorialButtons';
import TutorialHeader from './components/TutorialHeader';
import TutorialIcon from './components/TutorialIcon';
import TutorialPhotos from './components/TutorialPhotos';
import TutorialLikeDesktop from '../../../images/tutorial-like-desktop.png';
import TutorialLikeMobile from '../../../images/tutorial-like-mobile.png';

function TutorialLike() {
  return (
    <DatingPageWrapper>
      <div className="text-center p-3 mt-5 pt-5 mt-lg-0 pt-lg-3">
        <TutorialHeader />
        <TutorialPhotos desktopImage={TutorialLikeDesktop} mobileImage={TutorialLikeMobile} />
        <Row className="justify-content-center">
          <Col xs={8}>
            <TutorialIcon tutorialIcon={solid('heart')} iconColor="#32D74B" uniqueId="like" />
            <h2 className="h2 fw-bold mt-4">Like</h2>
            <p className="fs-4">
              On a user’s profile, the heart icon is to like
              this person and let me know you’re interested.
            </p>
          </Col>
        </Row>
        <TutorialButtons nextLink="dating-messages" />
      </div>
    </DatingPageWrapper>
  );
}

export default TutorialLike;
