import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';

interface TutorialPhotosProps {
  desktopImage: string;
  mobileImage: string;
}
const StyledDesktopImage = styled.div`
  aspect-ratio: 1.53;
`;
const StyledMobileImage = styled.div`
  aspect-ratio: 0.61;
`;
function TutorialPhotos({ desktopImage, mobileImage }: TutorialPhotosProps) {
  return (
    <Row className="justify-content-center my-4">
      <Col sm={8} md={6} lg={11}>
        <StyledDesktopImage className="d-none d-lg-block rounded-3">
          <Image className="w-100 h-100 rounded-3" src={desktopImage} alt="Pass deck desktop" />
        </StyledDesktopImage>
        <StyledMobileImage className="d-block d-lg-none rounded-3 mx-5">
          <Image className="w-100 h-100 rounded-3" src={mobileImage} alt="Pass deck desktop" />
        </StyledMobileImage>
      </Col>
    </Row>
  );
}

export default TutorialPhotos;
