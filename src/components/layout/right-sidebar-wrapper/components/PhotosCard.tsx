import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

function PhotosCard() {
  const photos = ['https://i.pravatar.cc/300?img=51', 'https://i.pravatar.cc/300?img=52', 'https://i.pravatar.cc/300?img=53', 'https://i.pravatar.cc/300?img=54', 'https://i.pravatar.cc/300?img=55', 'https://i.pravatar.cc/300?img=56'];
  return (
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
  );
}

export default PhotosCard;
