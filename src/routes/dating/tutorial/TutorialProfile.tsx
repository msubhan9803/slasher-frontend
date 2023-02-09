import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import ProfileDesktop from '../../../images/profile-desktop.png';
import ProfileMobile from '../../../images/profile-mobile.png';
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
function TutorialProfile() {
  return (
    <DatingPageWrapper>
      <div className="text-center p-3 mt-5 pt-5 mt-lg-0 pt-lg-3">
        <TutorialHeader />
        <TutorialPhotos desktopImage={ProfileDesktop} mobileImage={ProfileMobile} />
        <Row className="justify-content-center">
          <Col xs={8}>
            <TutorialIcon tutorialIcon={regular('user')} iconColor="#FF1800" uniqueId="profile" />
            <h2 className="h2 fw-bold mt-4">My Profile</h2>
            <p className="fs-4">
              On the main screen, the profile icon will allow you to view and edit your profile.
            </p>
          </Col>
        </Row>
        <div className="d-sm-flex justify-content-center mt-3">
          <Link to="/app/dating/tutorial/profile" className="me-3">
            <StyledNextButton variant="primary" className="fs-3">
              Find your match
            </StyledNextButton>
          </Link>
          <Link to="/app/dating/tutorial/profile">
            <StyledNextButton variant="secondary" className="fs-3 mt-3 mt-sm-0">
              Review your profile
            </StyledNextButton>
          </Link>
        </div>
      </div>
    </DatingPageWrapper>
  );
}

export default TutorialProfile;
