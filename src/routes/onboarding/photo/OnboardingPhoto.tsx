import React, { ChangeEvent, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Form, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import UnauthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedPageWrapper';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import RoundButton from '../../../components/ui/RoundButton';
import onboardingPhoto from '../../../api/onboarding';

const ImageContainer = styled.div`
  height: 18.75rem;
  background-color: #1F1F1F;
  border: 2px solid #3A3B46;
  cursor:pointer;
`;
const CustomCol = styled(Col)`
  width: 18.75rem;
`;
const AddIcon = styled.div`
  width: 1.329rem;
  height: 1.329rem;
  bottom: -0.35rem;
  right: -0.35rem;
`;
function OnboardingPhoto() {
  const navigate = useNavigate();
  const [imageUpload, setImageUpload] = useState<File>();
  const [errorMessage, setErrorMessage] = useState<string[]>();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target) {
      return;
    }
    if (e.target?.name === 'file' && e?.target?.files?.length) {
      const file = e.target.files[0];
      setImageUpload(file);
      e.target.value = '';
    }
  };
  const handleOnboardingPhoto = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    onboardingPhoto(imageUpload).then((res) => {
      setErrorMessage([]);
      Cookies.set('sessionToken', res.data.token);
      navigate('/onboarding/about-me');
    }).catch((error) => {
      setErrorMessage(error.response.data.message);
    });
  };
  return (
    <UnauthenticatedPageWrapper hideFooter valign="center">
      <h1 className="h2 text-center">Add your profile photo</h1>
      <Form className="d-flex justify-content-center">
        <Row className="h-100">
          <CustomCol className="my-3">
            <label htmlFor="file-upload" className="d-inline">
              {!imageUpload
                && (
                  <ImageContainer className="position-relative d-flex justify-content-center align-items-center rounded border-0 pe-auto">
                    <FontAwesomeIcon icon={solid('camera')} size="lg" className="text-light bg-primary p-3 rounded-circle " />
                    <AddIcon className="d-flex align-items-center justify-content-center text-center position-absolute bg-primary text-white rounded-circle">
                      <FontAwesomeIcon
                        icon={solid('plus')}
                        size="sm"
                        role="button"
                      />
                    </AddIcon>
                  </ImageContainer>
                )}

            </label>
            {imageUpload
              && (
                <ImageContainer className="position-relative d-flex align-items-center rounded border-0">
                  <Image
                    src={URL.createObjectURL(imageUpload)}
                    alt="Dating profile photograph"
                    className="w-100 h-100 img-fluid rounded"
                  />
                  <AddIcon className="d-flex align-items-center justify-content-center text-center position-absolute bg-white text-primary rounded-circle">
                    <FontAwesomeIcon
                      icon={solid('times')}
                      size="sm"
                      role="button"
                      onClick={() => setImageUpload(undefined)}
                    />
                  </AddIcon>
                </ImageContainer>
              )}
            <input
              id="file-upload"
              type="file"
              name="file"
              className="d-none"
              accept="image/*"
              onChange={(e) => {
                handleFileChange(e);
              }}
            />
          </CustomCol>
        </Row>
      </Form>
      <Row className="justify-content-center">
        <Col xs={9} sm={7} md={5} lg={4} xxl={3}>
          {errorMessage && errorMessage.length > 0 && (
            <div className="mt-4">
              <ErrorMessageList errorMessages={errorMessage} />
            </div>
          )}
          <Row className="my-4">
            <Col xs={6}>
              <RoundButtonLink to="/onboarding/about-me" className="w-100" variant="dark">
                Skip
              </RoundButtonLink>
            </Col>
            <Col xs={6}>
              <RoundButton type="submit" onClick={handleOnboardingPhoto} className="w-100" variant="primary">
                Next step
              </RoundButton>
            </Col>
          </Row>
        </Col>
      </Row>
    </UnauthenticatedPageWrapper>
  );
}

export default OnboardingPhoto;
