import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import CustomSelect from '../../../components/filter-sort/CustomSelect';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';

const sortoptions = [
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'releaseDate', label: 'Release Date' },
  { value: 'userRating', label: 'User Rating' },
];
function ShoppingSelect() {
  const params = useParams();
  return (
    <Row className="justify-content-between align-items-center">
      <Col md={4} lg={5} className="">
        <CustomSelect />
      </Col>
      <Col md={3} lg={5} xl={4} className="mt-4 mt-md-0">
        <CustomSelect options={sortoptions} type="sort" />
      </Col>
      <Col className={`d-lg-none mt-3 mt-md-0 mb-3 mb-md-0 order-md-3 order-first ${params['*'] === 'all' && 'd-none'}`}>
        <RoundButtonLink to="/shopping/all" className="w-100" variant="primary">
          Become a vendor
        </RoundButtonLink>
      </Col>
    </Row>
  );
}

export default ShoppingSelect;
