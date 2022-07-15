import React, { useState } from 'react';
import {
  Col, Container, Row,
} from 'react-bootstrap';
import NoNavigationPageWrapper from '../../../components/layout/main-site-wrapper/no-navigation/NoNavigationPageWrapper';
import LengthRestrictedTextArea from '../../../components/ui/LengthRestrictedTextArea';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';

function OnboardingAboutMe() {
  const [message, setMessage] = useState('');

  return (
    <NoNavigationPageWrapper>
      <Container>
        <h1 className="h4 mt-3 text-center text-md-start">About Me</h1>
        <p className="pb-0 my-0 fw-bold text-center text-md-start">Tell people a little about yourself! </p>
        <p className="pt-0 text-center text-md-start">Here are some ideas: your favorite horror movies, favorite book, music you like, if you make horror-related stuff.</p>
        <Row>
          <Col>
            <LengthRestrictedTextArea
              maxLength={1000}
              contentDetail={message}
              setContentDetail={setMessage}
              placeholder="Write here..."
            />
          </Col>
        </Row>
        <Row className="justify-content-center my-5">
          <Col xs={9} sm={7} md={5} lg={4} xxl={3}>
            <Row>
              <Col xs={6}>
                <RoundButtonLink to="/onboarding/hashtag" className="w-100" variant="dark">
                  Skip
                </RoundButtonLink>
              </Col>
              <Col xs={6}>
                <RoundButtonLink to="/onboarding/hashtag" className="w-100" variant="primary">
                  Next step
                </RoundButtonLink>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </NoNavigationPageWrapper>
  );
}

export default OnboardingAboutMe;
