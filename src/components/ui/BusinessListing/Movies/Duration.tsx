import { Col, Form } from 'react-bootstrap';

export default function MovieDuration() {
  return (
    <Col xs="12" md="6" className="my-2">
      <Form.Control type="text" placeholder="Duration in minutes" className="fs-4" />
    </Col>
  );
}
