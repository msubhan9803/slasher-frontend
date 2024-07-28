import { Col, Form } from 'react-bootstrap';

export default function ListingTitle() {
  return (
    <Col xs="12" className="my-2">
      <Form.Control type="text" placeholder="Title" className="fs-4" />
    </Col>
  );
}
