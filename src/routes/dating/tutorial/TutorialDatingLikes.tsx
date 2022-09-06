import React from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Col, Row } from 'react-bootstrap';
import DatingLikesDesktop from '../../../images/dating-likes-desktop.png';
import DatingLikesMobile from '../../../images/dating-likes-mobile.png';
import DatingPageWrapper from '../components/DatingPageWrapper';
import TutorialButtons from './components/TutorialButtons';
import TutorialHeader from './components/TutorialHeader';
import TutorialIcon from './components/TutorialIcon';
import TutorialPhotos from './components/TutorialPhotos';

function TutorialDatingLikes() {
  return (
    <DatingPageWrapper>
      <div className="text-center p-3 mt-5 pt-5 mt-lg-0 pt-lg-3">
        <TutorialHeader />
        <TutorialPhotos desktopImage={DatingLikesDesktop} mobileImage={DatingLikesMobile} />
        <Row className="justify-content-center">
          <Col xs={8}>
            <TutorialIcon tutorialIcon={regular('heart')} iconColor="#FF1800" uniqueId="dating-likes" />
            <h2 className="h2 fw-bold mt-4">Likes</h2>
            <p className="fs-4">
              In the Dating Menu, clicking Likes will show you the likes you received.
            </p>
          </Col>
        </Row>
        <TutorialButtons nextLink="preferences" />
      </div>
    </DatingPageWrapper>
  );
}

export default TutorialDatingLikes;
