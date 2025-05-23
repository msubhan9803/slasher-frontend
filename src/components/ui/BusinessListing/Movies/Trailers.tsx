import { Col, Row, Form } from 'react-bootstrap';
import { UseFormRegister } from 'react-hook-form';
import { BusinessListingKeys, BusinessListing } from '../../../../routes/business-listings/type';

type Props = {
  name: BusinessListingKeys;
  register: UseFormRegister<BusinessListing>;
  isVisible: boolean;
};

export default function Trailers({ name, register, isVisible }: Props) {
  if (!isVisible) {
    return null;
  }

  return (
    <Col xs="12" className="mt-4">
      <h2 className="fw-bold my-2">Trailers</h2>

      <Row>
        <Col xs="12" className="my-2">
          <Form.Control
            {...register('trailerLinks.main')}
            name="trailerLinks.main"
            type="text"
            placeholder="Main trailer (YouTube link)"
            className="fs-4"
          />
        </Col>
        <Col xs="12" className="my-2">
          <Form.Control
            {...register('trailerLinks.trailer2')}
            name="trailerLinks.trailer2"
            type="text"
            placeholder="Trailer #2 (YouTube link)"
            className="fs-4"
          />
        </Col>
        <Col xs="12" className="my-2">
          <Form.Control
            {...register('trailerLinks.trailer3')}
            name="trailerLinks.trailer3"
            type="text"
            placeholder="Trailer #3 (YouTube link)"
            className="fs-4"
          />
        </Col>
      </Row>
    </Col>
  );
}
