import { Col, Form } from 'react-bootstrap';
import { UseFormRegister } from 'react-hook-form';
import { BusinessListing, BusinessListingKeys } from '../../../routes/business-listings/type';

type Props = {
  name: BusinessListingKeys;
  register: UseFormRegister<BusinessListing>;
  isVisible: boolean;
};

export default function Email({ name, register, isVisible }: Props) {
  if (!isVisible) {
    return null;
  }

  return (
    <Col xs="12" className="my-2">
      <Form.Control
        {...register(name)}
        type="email"
        placeholder="Email"
        className="fs-4"
      />
    </Col>
  );
}
