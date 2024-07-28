import { Col, Row, Form } from 'react-bootstrap';
import { UseFormRegister } from 'react-hook-form';
import { BusinessListingKeys, BusinessListing } from '../../../../routes/business-listings/type';

type Props = {
  name: BusinessListingKeys;
  register: UseFormRegister<BusinessListing>
};

export default function Trailers({ name, register }: Props) {
  return (
    <Col xs="12" className="mt-4">
      <h2 className="fw-bold my-2">Trailers</h2>

      <Row>
        <Col xs="12" className="my-2">
          <Form.Control
            {...register(name)}
            name={`${name}.main`}
            type="text"
            placeholder="Main trailer (YouTube link)"
            className="fs-4"
          />
        </Col>
        <Col xs="12" className="my-2">
          <Form.Control
            {...register(name)}
            name={`${name}.trailer2`}
            type="text"
            placeholder="Main trailer (YouTube link)"
            className="fs-4"
          />
        </Col>
        <Col xs="12" className="my-2">
          <Form.Control
            {...register(name)}
            name={`${name}.trailer3`}
            type="text"
            placeholder="Main trailer (YouTube link)"
            className="fs-4"
          />
        </Col>
      </Row>
    </Col>
  );
}
