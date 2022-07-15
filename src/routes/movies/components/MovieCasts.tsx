import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

interface Props {
  movieCasts: CastsProps[];
}
interface CastsProps {
  image: string;
  name: string;
  designation: string;
}

function MovieCasts({ movieCasts }: Props) {
  return (
    <Row>
      {movieCasts.map((cast: CastsProps) => (
        <Col xs={4} md={3} lg={2} key={cast.name}>
          <Card className="bg-transparent my-2">
            <Card.Img variant="top" src={cast.image} className="rounded-3" />
            <Card.Body className="px-0">
              <Card.Title className="h6 m-0">
                {cast.name}
              </Card.Title>
              <Card.Text className="text-primary">
                {cast.designation}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default MovieCasts;
