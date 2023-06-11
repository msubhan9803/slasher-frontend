import React, { ChangeEvent } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import CharactersCounter from '../../../components/ui/CharactersCounter';
import CustomDatePicker from '../../../components/ui/CustomDatePicker';
import CustomSelect from '../../../components/filter-sort/CustomSelect';

interface InformationProps {
  description: string;
  charCount: number;
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (value: Date) => void;
  setEndDate: (value: Date) => void;
  handleMessageChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

function PlaceInformation({
  description, charCount, startDate, setStartDate, endDate, setEndDate, handleMessageChange,
}: InformationProps) {
  return (
    <>
      <Row>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <CustomSelect
            value="Category"
            onChange={() => { }}
            options={[{ value: 'disabled', label: 'Category' }]}
            type="form"
          />
        </Col>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <Form.Control type="text" placeholder="Place name" className="fs-4" />
        </Col>
      </Row>
      <Form.Group className="mt-3 fs-5" controlId="Overview">
        <Form.Control
          maxLength={1000}
          rows={8}
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
          totalChar={1000}
        />
      </Form.Group>
      <Form.Control type="text" placeholder="Website" className="fs-4 mt-3" />
      <Row>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <CustomDatePicker date={startDate} setDate={setStartDate} label="Start date (if not open all year)" />
        </Col>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <CustomDatePicker date={endDate} setDate={setEndDate} label="End date (if not open all year)" />
        </Col>
      </Row>
      <Row>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <Form.Control type="text" placeholder="Street Address" className="fs-4" />
        </Col>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <Form.Control type="text" placeholder="City" className="fs-4" />
        </Col>
      </Row>
      <Row>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <CustomSelect
            value="State/Province"
            onChange={() => { }}
            options={[{ value: 'disabled', label: 'State/Province' }]}
            type="form"
          />
        </Col>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <CustomSelect
            value="Country"
            onChange={() => { }}
            options={[{ value: 'disabled', label: 'Country' }]}
            type="form"
          />
        </Col>
      </Row>
    </>
  );
}

export default PlaceInformation;
