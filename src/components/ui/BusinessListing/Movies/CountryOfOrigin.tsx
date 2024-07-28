import { Col, Form } from 'react-bootstrap';

export default function CountryOfOrigin() {
  return (
    <Col xs="12" md="6" className="my-2">
      <Form.Control type="text" placeholder="Country of origin" className="fs-4" />
    </Col>
  );
}
