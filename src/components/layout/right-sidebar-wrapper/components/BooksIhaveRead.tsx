import React from 'react';
import { Col, Row } from 'react-bootstrap';
import WatchListCard from './WatchListCard';

function BooksIhaveRead() {
  return (
    <>
      <Row className="mt-3">
        <Col xs={9}>
          <h2 className="h4">Books I&apos;ve read</h2>
        </Col>
        <Col xs={3} className="text-end">
          <small className="text-primary">See All</small>
        </Col>
      </Row>
      <WatchListCard />
    </>
  );
}

export default BooksIhaveRead;
