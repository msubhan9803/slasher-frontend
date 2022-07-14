import React from 'react';
import { Col, Row } from 'react-bootstrap';
import FriendsCard from './FriendsCard';

function Friends() {
  return (
    <>
      <Row className="mt-3">
        <Col xs={9} className="d-flex">
          <h2 className="h4">Friends</h2>
          <p className="ms-3 mt-1">310</p>
        </Col>
        <Col xs={3} className="text-end">
          <small className="text-primary">See All</small>
        </Col>
      </Row>
      <FriendsCard />
    </>
  );
}

export default Friends;
