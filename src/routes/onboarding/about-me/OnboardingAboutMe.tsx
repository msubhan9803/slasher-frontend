import React, { useState } from 'react';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { onboardingAboutMe } from '../../../api/onboarding';
import UnauthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedPageWrapper';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import LengthRestrictedTextArea from '../../../components/ui/LengthRestrictedTextArea';
import RoundButton from '../../../components/ui/RoundButton';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';

function OnboardingAboutMe() {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string[]>();

  const handleAboutMeAPI = () => {
    if (message.length === 0) {
      setErrorMessage(['Please enter about yourself']);
      return true;
    }
    onboardingAboutMe(message).then(() => {
      setErrorMessage([]);
      navigate('/onboarding/hashtag');
    }).catch((error) => {
      setErrorMessage(error.response.data.message);
    });
    return true;
  };
  return (
    <UnauthenticatedPageWrapper hideFooter valign="start">
      <h1 className="h2 mt-5 text-center text-md-start">About Me</h1>
      <p className="fs-3 pb-0 my-0 fw-bold text-center text-md-start">Tell people a little about yourself! </p>
      <p className="pt-0 text-center text-md-start">Here are some ideas: your favorite horror movies, favorite book, music you like, if you make horror-related stuff.</p>
      <Form>
        <Row>
          <Col>
            <LengthRestrictedTextArea
              maxLength={1000}
              rows={17}
              contentDetail={message}
              setContentDetail={setMessage}
              placeholder="Write here..."
            />
          </Col>
        </Row>
      </Form>
      {errorMessage && errorMessage.length > 0 && (
        <ErrorMessageList errorMessages={errorMessage} />
      )}
      <Row className="justify-content-center my-5">
        <Col xs={9} sm={7} md={5} lg={4} xxl={3}>
          <Row>
            <Col xs={6}>
              <RoundButtonLink to="/onboarding/hashtag" className="w-100" variant="dark">
                Skip
              </RoundButtonLink>
            </Col>
            <Col xs={6}>
              <RoundButton type="submit" className="w-100" variant="primary" onClick={handleAboutMeAPI}>
                Next step
              </RoundButton>
            </Col>
          </Row>
        </Col>
      </Row>
    </UnauthenticatedPageWrapper>
  );
}

export default OnboardingAboutMe;
