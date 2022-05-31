import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Form, Row,
} from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import UnauthenticatedSiteWrapper from '../../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';

const Images = [
  { name: 'img1', val: 'img1' },
  { name: 'img1', val: 'img1' },
  { name: 'img1', val: 'img1' },
  { name: 'img1', val: 'img1' },
  { name: 'img1', val: 'img1' },
  { name: 'img1', val: 'img1' },
];
function DatingSetupAddPhotos() {
  return (
    <UnauthenticatedSiteWrapper>
      <Row className="justify-content-center text-center">
        <Col lg={8}>
          <h3>Add Photos</h3>
          <p>
            You must add at least one photo to your dating profile, otherwise
            your profile will not be shown to others and you will not be able to see
            other profiles.
          </p>
          <p>Tips</p>
        </Col>
      </Row>
      <Row xs={12} lg="auto" className="justify-content-center">
        <Col className="d-flex justify-content-center" xs={12} md={4}>
          <FontAwesomeIcon icon={solid('check')} size="lg" className="text-primary" />
          <p className="mx-2">Use recent photos</p>
        </Col>
        <Col className="d-flex justify-content-center" xs={12} md={4}>
          <FontAwesomeIcon icon={solid('check')} size="lg" className="text-primary" />
          <p className="mx-2">Be sure your photos are clear</p>
        </Col>
        <Col className="d-flex justify-content-center" xs={12} md={4}>
          <FontAwesomeIcon icon={solid('check')} size="lg" className="text-primary" />
          <p className="mx-2">Use photos of you</p>
        </Col>
      </Row>
      <Row className="justify-content-center text-center h-100">
        <Col lg={8} className="h-100">
          <Row className="h-100">
            {Images.map((images) => (
              <Col key={images.name} xs={4} className="my-3">
                <div className="rounded-3 d-flex justify-content-center align-items-center  w-auto" style={{ height: '197px', backgroundColor: '#1F1F1F', border: '2px solid #3A3B46' }}>
                  <FontAwesomeIcon icon={solid('camera')} size="lg" className="text-light bg-primary p-3 rounded-circle " />
                </div>
                <Form.Check
                  inline
                  label="Make primary photo"
                  name="radio"
                  type="radio"
                  id="inline-radio"
                  className="p-sm-0 text-start mt-2"
                />
              </Col>
            ))}

          </Row>
        </Col>
        <Row className="justify-content-center">
          <Col md={5} className="mt-3">
            <Button
              variant="primary"
              type="submit"
              className="w-100 px-5"
              size="lg"
            >
              Next Step
            </Button>
          </Col>
        </Row>
      </Row>
    </UnauthenticatedSiteWrapper>
  );
}

export default DatingSetupAddPhotos;
