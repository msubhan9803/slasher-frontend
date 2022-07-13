import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

function PodcastsCard() {
  const podcastsImage = ['https://i.pravatar.cc/300?img=52', 'https://i.pravatar.cc/300?img=53', 'https://i.pravatar.cc/300?img=54'];
  return (
    <div className="p-3 bg-dark rounded-3">
      <Row>
        {podcastsImage.map((image) => (
          <Col md={4} key={image}>
            <Card className="bg-transparent my-2">
              <Card.Img variant="top" src={image} className="rounded-3 w-100 h-100" />
              <Card.Body className="px-1">
                <Card.Text className="small">
                  The No Sleep Podcast
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default PodcastsCard;
