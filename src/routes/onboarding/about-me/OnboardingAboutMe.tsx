import React, { useState } from 'react';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { onboardingAboutMe } from '../../../api/onboarding';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import LengthRestrictedTextArea from '../../../components/ui/LengthRestrictedTextArea';
import RoundButton from '../../../components/ui/RoundButton';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';

function OnboardingAboutMe() {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('');
  const [errorMessages, setErrorMessages] = useState<string[]>();

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Clear any old error messages
    setErrorMessages([]);

    if (message.length === 0) {
      setErrorMessages(['Please add some text to describe yourself to the community, or tap the "Skip" button to skip this step for now.']);
      return;
    }

    onboardingAboutMe(message).then(() => {
      navigate('/onboarding/hashtag');
    }).catch((error) => {
      setErrorMessages(error.response.data.message);
    });
  };
  return (
    <>
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
        <ErrorMessageList errorMessages={errorMessages} />
        <Row className="justify-content-center my-5">
          <Col xs={9} sm={7} md={5} lg={4} xxl={3}>
            <Row>
              <Col xs={6}>
                <RoundButtonLink to="/onboarding/hashtag" className="w-100" variant="dark">
                  Skip
                </RoundButtonLink>
              </Col>
              <Col xs={6}>
                <RoundButton type="submit" className="w-100" variant="primary" onClick={handleSubmit}>
                  Next step
                </RoundButton>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default OnboardingAboutMe;
