import React, { ChangeEvent } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import CharactersCounter from '../../../components/ui/CharactersCounter';
import CustomSelect from '../../../components/filter-sort/CustomSelect';

interface InformationProps {
  description: string;
  charCount: number;
  handleMessageChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

function ShoppingInformation({
  description, charCount, handleMessageChange,
}: InformationProps) {
  return (
    <>
      <Form.Control type="text" placeholder="Title" className="fs-4 mt-3" />
      <Form.Group className="mt-3 fs-5" controlId="Overview">
        <Form.Control
          maxLength={113}
          rows={5}
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
          totalChar={113}
        />
      </Form.Group>
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

export default ShoppingInformation;
