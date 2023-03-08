import React, { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import CharactersCounter from '../../../components/ui/CharactersCounter';
import CustomDatePicker from '../../../components/ui/CustomDatePicker';
import RoundButton from '../../../components/ui/RoundButton';
import { StyleButton } from '../../../components/ui/StyleButton';

function ShoppingSpecialOffer() {
  const [description, setDescription] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setDescription(e.target.value);
  };
  return (

    <div className="bg-dark p-4 mt-4 rounded bg-mobile-transparent">
      <h1 className="h2 fw-bold">Offer information</h1>
      <Row>
        <Col md={6} className="mt-3">
          <Form.Control type="text" placeholder="Offer code" className="fs-4" />
          <Form.Text className="text-light fs-4">
            Share the promotional code people need to use on your website to claim the offer.
          </Form.Text>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <Form.Group className="mb-3" controlId="Offer description">
            <Form.Control
              maxLength={45}
              rows={4}
              as="textarea"
              value={description}
              onChange={handleMessageChange}
              placeholder="Description"
              style={{ resize: 'none' }}
              className="fs-4"
            />
            <CharactersCounter
              counterClass="float-end fs-4 me-2"
              charCount={charCount}
              totalChar={45}
            />
          </Form.Group>

        </Col>

      </Row>
      <Row>
        <Col md={6}>
          <Form.Text className="text-light fs-4">
            Please describe your offer here. Examples: &apos;25% off&apos;,
            &apos;Free shipping&apos;, or &apos;Buy 1 get 1 free!&apos;
          </Form.Text>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mt-3">
          <CustomDatePicker date={startDate} setDate={setStartDate} label="Start date" />
        </Col>
        <Col md={6} className="mt-3">
          <CustomDatePicker date={endDate} setDate={setEndDate} label="End date" />
        </Col>
      </Row>
      <StyleButton className="mt-3 mb-1 d-block d-md-flex justify-content-between align-items-center">
        <RoundButton className="update-btn fs-3 fw-bold px-5">Submit</RoundButton>
        <RoundButton className="deactivate-btn mt-4 mt-md-0 fs-3 fw-bold px-4 bg-black text-white">
          Delete offer
        </RoundButton>
      </StyleButton>
    </div>

  );
}

export default ShoppingSpecialOffer;
