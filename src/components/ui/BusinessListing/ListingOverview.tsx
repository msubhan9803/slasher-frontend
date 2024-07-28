import { Col, Form } from 'react-bootstrap';
import { UseFormRegister } from 'react-hook-form';
import CharactersCounter from '../CharactersCounter';
import {
  BusinessListing,
  BusinessListingKeys,
} from '../../../routes/business-listings/type';

type Props = {
  name: BusinessListingKeys;
  register: UseFormRegister<BusinessListing>;
  charCount: number;
};

export default function ListingOverview({ name, register, charCount }: Props) {
  return (
    <Col xs="12" className="my-2">
      <Form.Group className="fs-5" controlId="Overview">
        <Form.Control
          {...register(name)}
          maxLength={113}
          rows={6}
          as="textarea"
          placeholder="Overview"
          style={{ resize: 'none' }}
          className="fs-4"
        />

        <CharactersCounter
          counterClass="float-end fs-5 me-2"
          charCount={charCount}
          totalChar={113}
        />
      </Form.Group>
    </Col>
  );
}
