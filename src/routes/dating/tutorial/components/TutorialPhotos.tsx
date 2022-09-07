import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';

interface TutorialPhotosProps {
  desktopImage: string;
  mobileImage: string;
}
function TutorialPhotos({ desktopImage, mobileImage }: TutorialPhotosProps) {
  return (
    <Row className="justify-content-center my-4">
      <Col sm={8} md={6} lg={11}>
        <Image className="w-100 rounded-3 d-none d-lg-block" src={desktopImage} alt="Pass deck desktop" />
        <Image className="w-100 rounded-3 d-block d-lg-none px-5" src={mobileImage} alt="Pass deck desktop" />
      </Col>
    </Row>
  );
}

export default TutorialPhotos;
