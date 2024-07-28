import { Col, Form } from 'react-bootstrap';
import { UseFormRegister } from 'react-hook-form';
import { BusinessListing, BusinessListingKeys } from '../../../../routes/business-listings/type';

type Props = {
  name: BusinessListingKeys;
  register: UseFormRegister<BusinessListing>
};

export default function YearReleased({ name, register }: Props) {
  return (
    <Col xs="12" md="6" className="my-2">
      <Form.Control {...register(name)} type="text" placeholder="Year released" className="fs-4" />
    </Col>
  );
}
