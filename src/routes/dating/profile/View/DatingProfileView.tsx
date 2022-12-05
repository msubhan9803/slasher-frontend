import React, { useState } from 'react';
import { Col } from 'react-bootstrap';
import DatingPageWrapper from '../../components/DatingPageWrapper';
// import { useParams } from 'react-router-dom';

const initial = {
  nameAndAge: 'Elizabeth, 28',
  gender: 'female',
  distance: '24 mi/39 km',
  aboutMe: 'By day I am a financial advisor, at night I am a beer drinking music fan who loves attending live music events. Up for all and any adventures and wants someone to complement my life, not complicate it. Hit me up if you feel the same. Fun loving barista who enjoys bike riding, hiking, and eating pepperoni pizza. I have two dogs who I will love more than you and a collection of band t-shirts that will surprise you. I’ve always known the secret to happiness is gratitude. I’m still surprised and humbled by how much I have in my life to be grateful for!',
  height: '5\'4"/164 cm',
  bodyType: 'Tall',
  tattoos: 'yes',
};

function DatingProfileView() {
//   const params = useParams();
  // console.log('params.datingUserId?', params.datingUserId);
  const [state] = useState(initial);

  return (
    <DatingPageWrapper>
      DatingProfileDetails
      <div>{state.nameAndAge}</div>
      <div>{state.gender}</div>
      <div>{state.distance}</div>

      <div>About me</div>
      <div>{state.aboutMe}</div>

      <div>Appearance</div>
      <Col>
        <div>Height</div>
        <div>{state.height}</div>
      </Col>

      <Col>
        <div>Body type</div>
        <div>{state.bodyType}</div>
      </Col>

      <Col>
        <div>Tattoos</div>
        <div>{state.tattoos}</div>
      </Col>
    </DatingPageWrapper>
  );
}

export default DatingProfileView;
