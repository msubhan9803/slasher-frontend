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
  isVisible: boolean;
};

export default function ListingOverview({
  name, register, charCount, isVisible,
}: Props) {
  if (!isVisible) {
    return null;
  }

  return (
    <Col xs="12" className="my-2">
      <Form.Group className="fs-5" controlId="Overview">
        <Form.Control
          {...register(name)}
          maxLength={1000}
          rows={6}
          as="textarea"
          placeholder="Overview"
          style={{ resize: 'none' }}
          className="fs-4"
        />

        <CharactersCounter
          counterClass="float-end fs-5 me-2"
          charCount={charCount}
          totalChar={1000}
        />
      </Form.Group>
    </Col>
  );
}
