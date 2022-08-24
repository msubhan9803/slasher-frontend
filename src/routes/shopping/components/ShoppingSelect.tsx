import React from 'react';
import { Col, Row } from 'react-bootstrap';
import SortData from '../../../components/filter-sort/SortData';

const sortoptions = [
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'releaseDate', label: 'Release Date' },
  { value: 'userRating', label: 'User Rating' },
];
function ShoppingSelect() {
  return (
    <Row className="justify-content-between align-items-center">
      <Col md={4} lg={5} className="">
        <SortData type="select" className="rounded-5" />
      </Col>
      <Col md={3} lg={5} xl={4} className="mt-4 mt-md-0">
        <SortData title="Sort: " sortoptions={sortoptions} type="sort" className="rounded-5" />
      </Col>
    </Row>
  );
}

export default ShoppingSelect;
