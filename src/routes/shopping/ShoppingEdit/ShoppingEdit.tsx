import React, { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import CharactersCounter from '../../../components/ui/CharactersCounter';
import PhotoUploadInput from '../../../components/ui/PhotoUploadInput';
import RoundButton from '../../../components/ui/RoundButton';
import { StyleButton } from '../../../components/ui/StyleButton';
import CustomSelect from '../../../components/filter-sort/CustomSelect';

function ShoppingEdit() {
  const [description, setDescription] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setDescription(e.target.value);
  };
  return (
    <div className="bg-dark p-4 rounded bg-mobile-transparent mt-3">
      <Row>
        <Col md={6} lg={12} xl={6}>
          <div className="d-block d-md-flex align-items-center">
            <PhotoUploadInput
              className="mx-auto mx-md-0 me-md-3"
              height="10rem"
              variant="outline"
            // onChange={(file) => {
            //   // TODO
            // }}
            />
            <div className="text-center text-md-start mt-4 mt-md-0">
              <h1 className="h3 mb-2 fw-bold">Change profile photo</h1>
              <div className="d-block justify-content-center">
                <p className="fs-5 text-light mb-0">
                  Recommended size: 180x180 pixels
                </p>
                <p className="fs-5 text-light mb-0">
                  (jpg, png)
                </p>
              </div>
            </div>
          </div>
        </Col>
        <Col md={6} lg={12} xl={6} className="mt-5 mt-md-0 mt-lg-5 mt-xl-0">
          <div className="d-block d-md-flex align-items-center">
            <PhotoUploadInput
              className="mx-auto mx-md-0 me-md-3"
              height="10rem"
              variant="outline"
            // onChange={(file) => {
            //   // TODO
            // }}
            />
            <div className="text-center text-md-start mt-4 mt-md-0">
              <h1 className="h3 mb-2 fw-bold">Change cover photo</h1>
              <div className="d-block justify-content-center">
                <p className="fs-5 text-light mb-0">
                  Recommended size: 830x467 pixels
                </p>
                <p className="fs-5 text-light mb-0">
                  (jpg, png)
                </p>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <h2 className="d-md-block mt-4">Edit information</h2>
      <Row>
        <Col md={6} className="mt-3">
          <Form.Control type="text" placeholder="Business name" className="fs-4" />
        </Col>
        <Col md={6} className="mt-3">
          <Form.Control type="text" placeholder="Email address" className="fs-4" />
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mt-3">
          <Form.Control type="text" placeholder="Phone" className="fs-4" />
        </Col>
        <Col md={6} className="mt-3">
          <Form.Control type="text" placeholder="Website" className="fs-4" />
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mt-3">
          <Form.Control type="text" placeholder="Street" className="fs-4" />
        </Col>
        <Col md={6} className="mt-3">
          <Form.Control type="text" placeholder="City" className="fs-4" />
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mt-3">
          <CustomSelect
            value="State/Province"
            onChange={() => { }}
            options={[{ value: 'disabled', label: 'State/Province' }]}
            type="form"
          />
        </Col>
        <Col md={6} className="mt-3">
          <CustomSelect
            value="Country"
            onChange={() => { }}
            options={[{ value: 'disabled', label: 'Country' }]}
            type="form"
          />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <Form.Group className="mb-3" controlId="Overview">
            <Form.Control
              maxLength={113}
              rows={4}
              as="textarea"
              value={description}
              onChange={handleMessageChange}
              placeholder="Overview"
              style={{ resize: 'none' }}
              className="fs-4"
            />
            <CharactersCounter
              counterClass="float-end fs-4 me-2"
              charCount={charCount}
              totalChar={113}
            />
          </Form.Group>
        </Col>
      </Row>
      <StyleButton className="mt-3 mb-1 d-block d-md-flex justify-content-between align-items-center">
        <RoundButton className="update-btn px-3">Update listing</RoundButton>
        <RoundButton className="deactivate-btn mt-4 mt-md-0 px-4 bg-black text-white">
          Deactivate listing
        </RoundButton>
      </StyleButton>
    </div>
  );
}

export default ShoppingEdit;
