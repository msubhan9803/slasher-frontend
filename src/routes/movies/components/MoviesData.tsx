import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

interface Props {
  selectedTab: string;
  myMovies: MoviesProps[];
}
interface MoviesProps {
  id: number;
  image: string;
  name: string;
  year: string;
  liked: boolean;
}
function MoviesData({ selectedTab, myMovies }: Props) {
  return (
    <Row className="p-3 bg-dark rounded-3">
      {selectedTab === 'myMovies' && myMovies.map((moviesData: MoviesProps) => (
        <Col xs={6} md={4} xxl={3} className="" key={moviesData.id}>
          <Card className="bg-transparent my-2">
            <Card.Img variant="top" src={moviesData.image} className="rounded-3" />
            <Card.Body className="px-0">
              <Card.Text className="d-flex justify-content-between align-items-center mb-0">
                {moviesData.year}
                {moviesData.liked ? (
                  <FontAwesomeIcon icon={regular('thumbs-up')} className="text-success rounded-circle border p-1" size="sm" />
                ) : (
                  <FontAwesomeIcon icon={regular('thumbs-down')} className="text-primary rounded-circle border p-1" size="sm" />
                )}
              </Card.Text>
              <Card.Text>
                Dreamcatcher: Get ready for a killer night out
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default MoviesData;
