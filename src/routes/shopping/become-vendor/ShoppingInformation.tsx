import React, { ChangeEvent } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import styled from 'styled-components';

interface InformationProps {
  description: string;
  charCount: number;
  handleMessageChange: (value: ChangeEvent<HTMLInputElement>) => void;
}
const CustomSpan = styled(Form.Text)`
  margin-top: -1.77rem;
  margin-right: .7rem;
`;

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
        <CustomSpan className="float-end fs-4">{`${charCount}/${113} characters`}</CustomSpan>
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
