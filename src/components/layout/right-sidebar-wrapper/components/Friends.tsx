import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

function Friends() {
  const friendPhotos = ['https://i.pravatar.cc/300?img=50', 'https://i.pravatar.cc/300?img=51', 'https://i.pravatar.cc/300?img=52', 'https://i.pravatar.cc/300?img=53', 'https://i.pravatar.cc/300?img=54', 'https://i.pravatar.cc/300?img=55'];
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

      <div className="p-3 bg-dark rounded-3">
        <Row>
          {friendPhotos.map((friendPhoto) => (
            <Col md={4} key={friendPhoto}>
              <Card className="bg-transparent my-2 position-relative">
                <Card.Img variant="top" src={friendPhoto} className="rounded-circle w-100 h-100" />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}

export default Friends;
