import { Col, Form } from 'react-bootstrap';
import { Controller, UseFormRegister } from 'react-hook-form';
import { BusinessListingKeys, BusinessListing } from '../../../../routes/business-listings/type';

type Props = {
  name: BusinessListingKeys;
  register: UseFormRegister<BusinessListing>
};

export default function CountryOfOrigin({ name, register }: Props) {
  return (
    <Col xs="12" md="6" className="my-2">
      <Form.Control
        {...register(name)}
        type="text"
        placeholder="Country of origin"
        className="fs-4"
      />
    </Col>
  );
}
