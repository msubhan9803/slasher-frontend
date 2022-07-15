import React, { ChangeEvent, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Container, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import NoNavigationPageWrapper from '../../../components/layout/main-site-wrapper/no-navigation/NoNavigationPageWrapper';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';

const ImageContainer = styled.div`
  height: 18.75rem;
  background-color: #1F1F1F;
  border: 0.125rem solid #3A3B46;
  cursor:pointer;
`;
const CustomCol = styled(Col)`
  width: 18.75rem;
`;

function OnboardingPhoto() {
  const [imageUpload, setImageUpload] = useState<string>('');
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target) {
      return;
    }
    if (e.target?.name === 'file' && e?.target?.files?.length) {
      setImageUpload(URL.createObjectURL(e.target.files[0]));
      e.target.value = '';
    }
  };

  return (
    <NoNavigationPageWrapper className="align-items-center">
      <Container fluid>
        <h1 className="h3 text-center">Add your profile photo</h1>
        <div className="d-flex justify-content-center align-items-center my-auto">
          <Row className="h-100">
            <CustomCol className="my-3">
              <label htmlFor="file-upload" className="d-inline">
                {imageUpload.length === 0
                  && (
                    <ImageContainer className="position-relative d-flex justify-content-center align-items-center rounded border-0 pe-auto">
                      <FontAwesomeIcon icon={solid('camera')} size="lg" className="text-light bg-primary p-3 rounded-circle " />
                      <FontAwesomeIcon
                        icon={solid('plus')}
                        size="sm"
                        role="button"
                        className="position-absolute bg-primary text-white rounded-circle"
                        style={{
                          padding: '0.313rem 0.438rem',
                          top: '17.62rem',
                          left: '15.87rem',
                        }}
                      />
                    </ImageContainer>
                  )}

              </label>
              {imageUpload.length > 0
                && (
                  <ImageContainer className="position-relative d-flex align-items-center rounded border-0">
                    <Image
                      src={imageUpload}
                      alt="Dating profile photograph"
                      className="w-100 h-100 img-fluid rounded"
                    />
                    <FontAwesomeIcon
                      icon={solid('times')}
                      size="sm"
                      role="button"
                      className="position-absolute bg-white text-primary rounded-circle"
                      style={{
                        padding: '0.313rem 0.438rem',
                        top: '17.62rem',
                        left: '15.87rem',
                      }}
                      onClick={() => setImageUpload('')}
                    />
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
        </div>
        <Row className="justify-content-center my-5">
          <Col xs={9} sm={7} md={5} lg={4} xxl={3}>
            <Row>
              <Col xs={6}>
                <RoundButtonLink to="/onboarding/about-me" className="w-100" variant="dark">
                  Skip
                </RoundButtonLink>
              </Col>
              <Col xs={6}>
                <RoundButtonLink to="/onboarding/about-me" className="w-100" variant="primary">
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

export default OnboardingPhoto;
