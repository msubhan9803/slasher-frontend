import React, { ChangeEvent } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import CharactersCounter from '../../../components/ui/CharactersCounter';

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
          counterClass="float-end fs-4"
          charCount={charCount}
          totalChar={113}
          marginTop="-1.77rem"
          marginRight=".7rem"
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
          <Form.Select defaultValue="">
            <option value="" disabled>State/Province</option>
          </Form.Select>
        </Col>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <Form.Select defaultValue="">
            <option value="" disabled>Country</option>
          </Form.Select>
        </Col>
      </Row>
    </>
  );
}

export default ShoppingInformation;
