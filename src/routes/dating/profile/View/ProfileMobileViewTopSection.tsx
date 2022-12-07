import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import styled from 'styled-components';
import mapPinIcon from '../../../../images/dating/dating-map-pin.svg';
import profileImg1 from '../../../../images/dating/sample_profile/sample_profile1.png';
import profileImg2 from '../../../../images/dating/sample_profile/sample_profile2.png';
import profileImg3 from '../../../../images/dating/sample_profile/sample_profile3.png';
import profileImg4 from '../../../../images/dating/sample_profile/sample_profile4.png';
import profileImg5 from '../../../../images/dating/sample_profile/sample_profile5.png';
import profileImg6 from '../../../../images/dating/sample_profile/sample_profile6.png';
import profileImg7 from '../../../../images/dating/sample_profile/sample_profile7.png';

const Gender = styled.div`
  color: #FF1800;
  font-size: 1rem;
  margin-top: 0.625rem;
  margin-bottom: 1.125rem;
`;

const HeroProfileImgMobile = styled.div`
  width: 100%;
  margin: 0 auto 1.25rem;
`;

function ProfileMobileView({ state }: any) {
  return (
    <div>
      <div className="text-center">
        <HeroProfileImgMobile><img className="rounded-3 d-block m-auto" src={profileImg1} alt="Profile Here" /></HeroProfileImgMobile>
        <div>{state.nameAndAge}</div>
        <Gender>{state.gender}</Gender>
        <div className="d-flex justify-content-center mb-3">
          <span className="me-2"><img style={{}} src={mapPinIcon} alt="Map Icon Here" /></span>
          <div className="text-light">{state.distance}</div>
        </div>

        <Row className="mt-3 gy-3 justify-content-start" xs="3" sm="4" md="3">
          <Col><img className="rounded-3 d-block m-auto" src={profileImg2} alt="Profile Here" style={{ maxWidth: '92px' }} /></Col>
          <Col><img className="rounded-3 d-block m-auto" src={profileImg3} alt="Profile Here" style={{ maxWidth: '92px' }} /></Col>
          <Col><img className="rounded-3 d-block m-auto" src={profileImg4} alt="Profile Here" style={{ maxWidth: '92px' }} /></Col>
          <Col><img className="rounded-3 d-block m-auto" src={profileImg5} alt="Profile Here" style={{ maxWidth: '92px' }} /></Col>
          <Col><img className="rounded-3 d-block m-auto" src={profileImg6} alt="Profile Here" style={{ maxWidth: '92px' }} /></Col>
          <Col><img className="rounded-3 d-block m-auto" src={profileImg7} alt="Profile Here" style={{ maxWidth: '92px' }} /></Col>
        </Row>
      </div>
    </div>
  );
}

export default ProfileMobileView;
