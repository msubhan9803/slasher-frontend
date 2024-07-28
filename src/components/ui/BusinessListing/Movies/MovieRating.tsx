import { Col, Form } from 'react-bootstrap';

export default function MovieRating() {
  return (
    <Col xs="12" md="6" className="my-2">
      <Form.Control type="text" placeholder="Official rating received" className="fs-4" />
    </Col>
  );
}
