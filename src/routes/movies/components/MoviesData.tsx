import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import MoviesFilterComponent from './MoviesFilterComponent';

interface Props {
  selectedTab: string;
  myMovies: MoviesProps[];
  showKeys: any;
  setShowKeys: any;
}
interface MoviesProps {
  id: number;
  image: string;
  name: string;
  year: string;
  liked: boolean;
}

const MovieCardStyle = styled(Card)`
  img {
    height: 10.938rem;
  }

  .card-img-overlay {
    top: 7.813rem;

    .rating {
      height: 1.563rem;
      line-height: 2
    }
  }
  .fa-star {
    color: #FF8A00;
  }
  .fa-thumbs-down {
    transform: rotateY(180deg);
  }
`;

function MoviesData({
  selectedTab, myMovies, showKeys, setShowKeys,
}: Props) {
  return (
    <div className="p-3 bg-dark rounded-3">
      {showKeys && (
        <MoviesFilterComponent showKeys={showKeys} setShowKeys={setShowKeys} />
      )}
      <Row>
        {selectedTab === 'myMovies' ? myMovies.map((moviesData: MoviesProps) => (
          <Col xs={6} sm={4} lg={3} className="" key={moviesData.id}>
            <MovieCardStyle className="bg-transparent my-2">
              <Card.Img variant="top" src={moviesData.image} className="rounded-3" />
              <Card.ImgOverlay className="d-flex justify-content-end">
                <Card.Title className="rating bg-white mb-0 px-2 rounded-5 small text-black">
                  <FontAwesomeIcon icon={solid('star')} className="me-1" size="sm" />
                  3.0
                </Card.Title>
              </Card.ImgOverlay>
              <Card.Body className="px-0">
                <Card.Text className="d-flex justify-content-between align-items-center mb-1 small text-light">
                  {moviesData.year}
                  {moviesData.liked ? (
                    <FontAwesomeIcon icon={regular('thumbs-up')} className="text-success rounded-circle border p-1" size="sm" />
                  ) : (
                    <FontAwesomeIcon icon={regular('thumbs-down')} className="text-primary rounded-circle border p-1" size="sm" />
                  )}
                </Card.Text>
                <Card.Text>
                  {moviesData.name}
                </Card.Text>
              </Card.Body>
            </MovieCardStyle>
          </Col>
        )) : (
          <h1 className="h4 text-center mb-0">No data found</h1>
        )}
      </Row>
    </div>

  );
}

export default MoviesData;
