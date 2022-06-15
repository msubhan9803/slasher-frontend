import React, { ChangeEvent, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import AuthenticatedPageWrapper from '../../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../../components/ui/RoundButton';

interface Image {
  title: string;
  image: string;
  id: number
}
const ImageContainer = styled('div')`
  height: 200px;
  background-color: #1F1F1F;
  border: 2px solid #3A3B46
`;

function DatingSetupAddPhotos() {
  const [imageUpload, setImageUpload] = useState<Image[]>([
    { title: '', image: '', id: 1 },
    { title: '', image: '', id: 2 },
    { title: '', image: '', id: 3 },
    { title: '', image: '', id: 4 },
    { title: '', image: '', id: 5 },
    { title: '', image: '', id: 6 },
  ]);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target) {
      return;
    }
    if (e.target.name === 'file' && e.target && e.target.files && e.target.files.length) {
      const newArr = [...imageUpload];
      const image = URL.createObjectURL(e.target.files[0]);
      newArr[index].image = image;
      setImageUpload(newArr);
    }
  };
  return (
    <AuthenticatedPageWrapper>
      <Row className="justify-content-center text-center">
        <Col lg={8}>
          <h3>Add Photos</h3>
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
        <Col lg={8} className="h-100">
          <Row className="h-100">
            {imageUpload.map((image, imageIndex) => (
              <Col key={image.id} xs={4} className="my-3">
                <label htmlFor={`file-upload-${imageIndex}`} className="d-inline">
                  {image.image === ''
                    ? (
                      <ImageContainer className="d-flex justify-content-center align-items-center w-100 rounded">
                        <FontAwesomeIcon icon={solid('camera')} size="lg" className="text-light bg-primary p-3 rounded-circle " />
                      </ImageContainer>
                    )
                    : (
                      <ImageContainer className="d-flex justify-content-center align-items-center w-100 rounded border-0">
                        <img
                          src={image.image}
                          alt="UploadImage.."
                          className="w-100 h-100 img-fluid rounded"
                        />
                      </ImageContainer>
                    )}
                  <input
                    key={image.id}
                    id={`file-upload-${imageIndex}`}
                    type="file"
                    name="file"
                    className="d-none"
                    accept="image/*"
                    onChange={(e) => {
                      handleFileChange(e, imageIndex);
                    }}
                  />
                </label>
                <Form.Check
                  inline
                  label="Make primary photo"
                  name="radio"
                  type="radio"
                  id={`primary-photo-radio-${imageIndex}`}
                  className="text-start mt-2"
                />
              </Col>
            ))}

          </Row>
        </Col>
        <Row className="justify-content-center">
          <Col md={5} className="mt-3">
            <RoundButton
              variant="primary"
              type="submit"
              className="w-100 px-5"
              size="lg"
            >
              Next Step
            </RoundButton>
          </Col>
        </Row>
      </Row>
    </AuthenticatedPageWrapper>
  );
}

export default DatingSetupAddPhotos;
