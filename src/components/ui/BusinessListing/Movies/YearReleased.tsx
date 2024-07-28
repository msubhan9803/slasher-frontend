import { Col, Form } from 'react-bootstrap';

export default function YearReleased() {
  return (
    <Col xs="12" md="6" className="my-2">
      <Form.Control type="text" placeholder="Year released" className="fs-4" />
    </Col>
  );
}
