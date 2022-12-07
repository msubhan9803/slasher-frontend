import React, { useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import RoundButton from '../../../../components/ui/RoundButton';
import mapPinIcon from '../../../../images/dating/dating-map-pin.svg';
import threeDotMenu from '../../../../images/dating/three_dots_icon.png';
import profileImg1 from '../../../../images/dating/sample_profile/sample_profile1.png';
import profileImg2 from '../../../../images/dating/sample_profile/sample_profile2.png';
import profileImg3 from '../../../../images/dating/sample_profile/sample_profile3.png';
import profileImg4 from '../../../../images/dating/sample_profile/sample_profile4.png';
import profileImg5 from '../../../../images/dating/sample_profile/sample_profile5.png';
import profileImg6 from '../../../../images/dating/sample_profile/sample_profile6.png';
import profileImg7 from '../../../../images/dating/sample_profile/sample_profile7.png';
import DatingPageWrapper from '../../components/DatingPageWrapper';
import ProfileMobileViewTopSection from './ProfileMobileViewTopSection';
import {
  Gender, Heading, HeroProfileImg, Section, SubHeading, Title,
} from './styledUtilsProfileView';

const initial = {
  nameAndAge: 'Elizabeth 28',
  gender: 'Female',
  distance: '24mi / 39km',
  aboutMe: 'By day I am a financial advisor, at night I am a beer drinking music fan who loves attending live music events. Up for all and any adventures and wants someone to complement my life, not complicate it. Hit me up if you feel the same. Fun loving barista who enjoys bike riding, hiking, and eating pepperoni pizza. I have two dogs who I will love more than you and a collection of band t-shirts that will surprise you. I’ve always known the secret to happiness is gratitude. I’m still surprised and humbled by how much I have in my life to be grateful for!',
  height: '5\'4"/164 cm',
  bodyType: 'Tall',
  tattoos: 'yes',
  lookingFor: 'Men',
  relationshipState: 'Open relationship',
  sexualOrientation: 'Bisexual',
  parentalStatus: 'No children',
  employment: 'Self-employed',
  educationLevel: 'Graduate',
  drinking: 'No',
  smoking: 'Casual Smoker',
  religion: 'Catholic',
  interests: ['Photography', 'Swimming', 'Anime', 'Dancing', 'Cooking', 'Board games'],
};

function DatingProfileView() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const params = useParams();
  // IMPORATANT NOTE:
  // We must use `params.datingUserId` to fetch individual profile details in the
  // `useEffect` hook in this component when we integrate server api to make this
  // component portable across popup screen i.e.,
  // "Dating Deck - View Profile, Viewer - (not matched), Popup"

  const [state] = useState(initial);

  return (
    <DatingPageWrapper>
      <Section>
        {/* Desktop Only Section. *LEARN: Hide by default and show on xxl and wider screens. */}
        <div className="d-none d-xxl-block">
          <div className="d-flex">
            {/* Left COLUMN */}
            <HeroProfileImg><img className="rounded-3 d-block m-auto" src={profileImg1} alt="Profile Here" /></HeroProfileImg>
            {/* Right COLUMN */}
            <div className="w-100 d-flex flex-column justify-content-between">
              {/* Upper */}
              <div className="d-flex justify-content-between">
                <div>
                  <Title>{state.nameAndAge}</Title>
                  <Gender>{state.gender}</Gender>
                  <div className="d-flex">
                    <span className="me-2"><img style={{}} src={mapPinIcon} alt="Map Icon Here" /></span>
                    <div className="text-light">{state.distance}</div>
                  </div>
                </div>

                <div>
                  <RoundButton>Send message</RoundButton>
                  <Button className="bg-dark border-0"><img className="rounded-3 ms-2" src={threeDotMenu} alt="Three dot menu" /></Button>
                </div>
              </div>

              {/* Lower */}
              <div className="d-flex">
                <img className="rounded-3 d-block m-auto" src={profileImg2} alt="Profile Here" style={{ maxWidth: '92px' }} />
                <img className="rounded-3 d-block m-auto" src={profileImg3} alt="Profile Here" style={{ maxWidth: '92px' }} />
                <img className="rounded-3 d-block m-auto" src={profileImg4} alt="Profile Here" style={{ maxWidth: '92px' }} />
                <img className="rounded-3 d-block m-auto" src={profileImg5} alt="Profile Here" style={{ maxWidth: '92px' }} />
                <img className="rounded-3 d-block m-auto" src={profileImg6} alt="Profile Here" style={{ maxWidth: '92px' }} />
                <img className="rounded-3 d-block m-auto" src={profileImg7} alt="Profile Here" style={{ maxWidth: '92px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile and Tablet Section. *LEARN: Hide on xxl and wider screens */}
        <div className="d-xxl-none">
          <ProfileMobileViewTopSection state={state} />
        </div>
      </Section>

      <Section>
        <Heading>About me</Heading>
        <div className="text-light">{state.aboutMe}</div>
      </Section>

      <Section>
        <Heading>Appearance</Heading>
        <Row className="gy-3" xs="2" md="3" lg="2" xl="3">
          <Col>
            <SubHeading>Height</SubHeading>
            <div className="fw-bold">{state.height}</div>
          </Col>
          <Col>
            <SubHeading>Body type</SubHeading>
            <div className="fw-bold">{state.bodyType}</div>
          </Col>
          <Col>
            <SubHeading>Tattoos</SubHeading>
            <div className="fw-bold">{state.tattoos}</div>
          </Col>
        </Row>
      </Section>

      <Section>
        <Heading>Basic Info</Heading>
        <Row className="gy-3" xs="2" md="3" lg="2" xl="3">
          <Col>
            <SubHeading>I&apos;m looking for</SubHeading>
            <div className="fw-bold">{state.lookingFor}</div>
          </Col>
          <Col>
            <SubHeading>Relationship Status</SubHeading>
            <div className="fw-bold">{state.relationshipState}</div>
          </Col>
          <Col>
            <SubHeading>Sexual Orientation</SubHeading>
            <div className="fw-bold">{state.sexualOrientation}</div>
          </Col>
          <Col>
            <SubHeading>Parental Status</SubHeading>
            <div className="fw-bold">{state.parentalStatus}</div>
          </Col>
          <Col>
            <SubHeading>Employment</SubHeading>
            <div className="fw-bold">{state.employment}</div>
          </Col>
          <Col>
            <SubHeading>Education Level</SubHeading>
            <div className="fw-bold">{state.educationLevel}</div>
          </Col>
          <Col>
            <SubHeading>Drinking</SubHeading>
            <div className="fw-bold">{state.drinking}</div>
          </Col>
          <Col>
            <SubHeading>Smoking</SubHeading>
            <div className="fw-bold">{state.smoking}</div>
          </Col>
          <Col>
            <SubHeading>Religion</SubHeading>
            <div className="fw-bold">{state.religion}</div>
          </Col>
        </Row>
      </Section>

      <Section>
        <Heading>Interests</Heading>
        <div className="fw-bold text-nowrap d-flex flex-wrap">{state.interests.map((interest) => <span key={interest} className="me-3 rounded-5 px-3 py-1" style={{ background: '#383838', margin: '0.625rem 0' }}>{interest}</span>)}</div>
      </Section>

    </DatingPageWrapper>
  );
}

export default DatingProfileView;
