import { Col, Row, Form } from 'react-bootstrap';
import { UseFormRegister } from 'react-hook-form';
import { BusinessListingKeys, BusinessListing } from '../../../routes/business-listings/type';

type Props = {
  text: string;
  name: BusinessListingKeys;
  register: UseFormRegister<BusinessListing>;
  isVisible: boolean;
};

export default function ListingLink({
  text, name, register, isVisible,
}: Props) {
  if (!isVisible) {
    return null;
  }

  return (
    <Col xs="12" className="mt-4">
      <h2 className="fw-bold my-2">{text}</h2>

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
