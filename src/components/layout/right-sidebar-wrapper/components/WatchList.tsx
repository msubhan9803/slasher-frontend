import React from 'react';
import { Col, Row } from 'react-bootstrap';
import WatchListCard from './WatchListCard';

function WatchList() {
  return (
    <>
      <Row className="mt-3">
        <Col xs={9}>
          <h2 className="h4">Watched list</h2>
        </Col>
        <Col xs={3} className="text-end">
          <small className="text-primary">See All</small>
        </Col>
      </Row>
      <WatchListCard />
    </>
  );
}

export default WatchList;
