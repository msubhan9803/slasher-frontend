import React from 'react';
import { Col, Row } from 'react-bootstrap';
import DatingPageWrapper from '../components/DatingPageWrapper';
import TutorialHeader from './components/TutorialHeader';
import TutorialMonsterLikeDesktop from '../../../images/tutorial-monster-like-desktop.png';
import TutorialMonsterLikeMobile from '../../../images/tutorial-monster-like-mobile.png';
import MonsterLikeIcon from '../../../images/monstre-like-bat-icon.svg';
import TutorialIcon from './components/TutorialIcon';
import TutorialPhotos from './components/TutorialPhotos';
import TutorialButtons from './components/TutorialButtons';

function TutorialMonsterLike() {
  return (
    <DatingPageWrapper>
      <div className="text-center p-3 mt-5 pt-5 mt-lg-0 pt-lg-3">
        <TutorialHeader />
        <TutorialPhotos
          desktopImage={TutorialMonsterLikeDesktop}
          mobileImage={TutorialMonsterLikeMobile}
        />
        <Row className="justify-content-center">
          <Col xs={8}>
            <TutorialIcon customTutorialIcon={MonsterLikeIcon} iconColor="#8F00FF" uniqueId="undo-icon" />
            <h2 className="h2 fw-bold mt-4">Monster like</h2>
            <p className="fs-4">
              On a user’s profile, the monster Like icon will allow you to send a
              priority like to that person. It will give your like priority over other
              likes that person has received.
            </p>
          </Col>
        </Row>
        <TutorialButtons nextLink="like" />
      </div>
    </DatingPageWrapper>
  );
}

export default TutorialMonsterLike;
