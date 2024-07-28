import { Col, Row, Form } from 'react-bootstrap';

export default function Trailers() {
  return (
    <Col xs="12" className="mt-4">
      <h2 className="fw-bold my-2">Trailers</h2>

      <Row>
        <Col xs="12" className="my-2">
          <Form.Control
            type="text"
            placeholder="Main trailer (YouTube link)"
            className="fs-4"
          />
        </Col>
        <Col xs="12" className="my-2">
          <Form.Control
            type="text"
            placeholder="Trailer #2 (YouTube link)"
            className="fs-4"
          />
        </Col>
        <Col xs="12" className="my-2">
          <Form.Control
            type="text"
            placeholder="Trailer #3 (YouTube link)"
            className="fs-4"
          />
        </Col>
      </Row>
    </Col>
  );
}
