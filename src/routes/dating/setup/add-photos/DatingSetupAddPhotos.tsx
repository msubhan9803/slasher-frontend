import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Container, Row,
} from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import RoundButton from '../../../../components/ui/RoundButton';
import ProfilePhotoGallery from '../../components/ProfilePhotoGallery';
import DatingPageWrapper from '../../components/DatingPageWrapper';

interface Image {
  title: string;
  image: string;
  id: number
}

function DatingSetupAddPhotos() {
  const [imageUpload, setImageUpload] = useState<Image[]>([
    { title: '', image: '', id: 1 },
    { title: '', image: '', id: 2 },
    { title: '', image: '', id: 3 },
    { title: '', image: '', id: 4 },
    { title: '', image: '', id: 5 },
    { title: '', image: '', id: 6 },
  ]);

  return (
    <DatingPageWrapper>
      <Container fluid>
        <Row className="justify-content-center text-center">
          <Col md={9} xl={7}>
            <h1 className="fw-bold">Add Photos</h1>
            <p className="fw-normal">
              You must add at least one photo to your dating profile, otherwise
              <br />
              your profile will not be shown to others and you will not be able to see
              other profiles.
            </p>
            <p>Tips</p>
          </Col>
        </Row>
        <Row xs={12} lg="auto" className="justify-content-center">
          <Col className="d-flex justify-content-center" xs={12} md={4}>
            <FontAwesomeIcon icon={solid('check')} size="lg" className="text-primary" />
            <p className="mx-2 fw-normal">Use recent photos</p>
          </Col>
          <Col className="d-flex justify-content-center" xs={12} md={4}>
            <FontAwesomeIcon icon={solid('check')} size="lg" className="text-primary" />
            <p className="mx-2 fw-normal">Be sure your photos are clear</p>
          </Col>
          <Col className="d-flex justify-content-center" xs={12} md={4}>
            <FontAwesomeIcon icon={solid('check')} size="lg" className="text-primary" />
            <p className="mx-2 fw-normal">Use photos of you</p>
          </Col>
        </Row>
        <Row className="justify-content-center text-center h-auto">
          <Col md={9} className="h-100">
            <Row className="h-100">
              {imageUpload.map((image, imageIndex) => (
                <Col key={image.id} xs={4} className="my-3">
                  <ProfilePhotoGallery
                    imageIndex={imageIndex}
                    imageUpload={imageUpload}
                    setImageUpload={setImageUpload}
                    isSlim
                  />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md={9} className="mt-3">
            <Row>
              <Col sm={4} className="my-3">
                <RoundButton
                  variant="primary"
                  type="submit"
                  className="w-100 px-5"
                  size="sm"
                  height="40px"
                >
                  Next Step
                </RoundButton>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </DatingPageWrapper>
  );
}

export default DatingSetupAddPhotos;
