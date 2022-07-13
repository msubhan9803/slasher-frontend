import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

function Photos() {
  const photos = ['https://i.pravatar.cc/300?img=51', 'https://i.pravatar.cc/300?img=52', 'https://i.pravatar.cc/300?img=53', 'https://i.pravatar.cc/300?img=54', 'https://i.pravatar.cc/300?img=55', 'https://i.pravatar.cc/300?img=56'];
  return (
    <>
      <Row className="mt-3">
        <Col xs={9}>
          <h2 className="h4">Photos</h2>
        </Col>
        <Col xs={3} className="text-end">
          <small className="text-primary">See All</small>
        </Col>
      </Row>

      <div className="p-3 bg-dark rounded-3">
        <Row>
          {photos.map((photo) => (
            <Col md={4} key={photo}>
              <Card className="bg-transparent my-2 position-relative">
                <Card.Img variant="top" src={photo} className="rounded-3 w-100 h-100" />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}

export default Photos;
