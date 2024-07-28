import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';

export default function MovieTrailers() {
  return (
    <Row>
      <Col>
        <Form.Control
          type="text"
          placeholder="Movie trailer (YouTube link)"
          className="fs-5"
        />
      </Col>
    </Row>
  );
}
