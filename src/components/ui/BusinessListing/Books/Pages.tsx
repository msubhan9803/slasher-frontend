import { Col, Form } from 'react-bootstrap';
import { UseFormRegister } from 'react-hook-form';
import { BusinessListingKeys, BusinessListing } from '../../../../routes/business-listings/type';

type Props = {
  name: BusinessListingKeys;
  register: UseFormRegister<BusinessListing>;
  isVisible: boolean;
};

export default function Pages({ name, register, isVisible }: Props) {
  if (!isVisible) {
    return null;
  }

  return (
    <Col xs="12" md="6" className="my-2">
      <Form.Control {...register(name)} type="text" placeholder="Pages" className="fs-4" />
    </Col>
  );
}
