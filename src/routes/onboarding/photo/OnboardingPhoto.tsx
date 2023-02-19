import React, { useState } from 'react';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import RoundButton from '../../../components/ui/RoundButton';
import { onboardingPhoto } from '../../../api/onboarding';
import PhotoUploadInput from '../../../components/ui/PhotoUploadInput';

function OnboardingPhoto() {
  const navigate = useNavigate();
  const [imageUpload, setImageUpload] = useState<File | null | undefined>();
  const [errorMessage, setErrorMessage] = useState<string[]>();

  const handleSubmit = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    // Clear previous error message
    setErrorMessage([]);

    onboardingPhoto(imageUpload).then(() => {
      navigate('/app/onboarding/about-me');
    }).catch((error) => {
      setErrorMessage(error.response.data.message);
    });
  };
  return (
    <>
      <h1 className="h2 text-center">Add your profile photo</h1>
      <Form>
        <div className="my-3">
          <PhotoUploadInput
            height="19rem"
            className="my-5 mx-auto"
            onChange={(file) => {
              setImageUpload(file);
            }}
          />
        </div>
        <Row className="justify-content-center">
          <Col xs={9} sm={7} md={5} lg={4} xxl={3}>
            <ErrorMessageList errorMessages={errorMessage} divClass="mt-4" />
            <Row>
              <Col xs={6}>
                <RoundButtonLink to="/app/onboarding/about-me" className="w-100" variant="dark">
                  Skip
                </RoundButtonLink>
              </Col>
              <Col xs={6}>
                <RoundButton type="submit" onClick={handleSubmit} className="w-100" variant="primary">
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

export default OnboardingPhoto;
