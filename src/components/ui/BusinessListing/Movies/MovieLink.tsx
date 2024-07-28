import { Col, Row, Form } from 'react-bootstrap';
import { Controller, UseFormRegister } from 'react-hook-form';
import { BusinessListingKeys, BusinessListing } from '../../../../routes/business-listings/type';

type Props = {
  name: BusinessListingKeys;
  register: UseFormRegister<BusinessListing>
};

export default function MovieLink({ name, register }: Props) {
  return (
    <Col xs="12" className="mt-4">
      <h2 className="fw-bold my-2">Link to watch your movie</h2>

      <Row>
        <Col xs="12" className="my-2">
          <Form.Control
            {...register(name)}
            type="text"
            placeholder="URL"
            className="fs-4"
          />
        </Col>
      </Row>
    </Col>
  );
}
