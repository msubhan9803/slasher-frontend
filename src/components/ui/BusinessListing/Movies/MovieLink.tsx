import { Col, Row, Form } from 'react-bootstrap';

export default function MovieLink() {
  return (
    <Col xs="12" className="mt-4">
      <h2 className="fw-bold my-2">Link to watch your movie</h2>

      <Row>
        <Col xs="12" className="my-2">
          <Form.Control
            type="text"
            placeholder="URL"
            className="fs-4"
          />
        </Col>
      </Row>
    </Col>
  );
}
