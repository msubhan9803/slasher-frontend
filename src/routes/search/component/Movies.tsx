import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import { SearchProps } from '../SearchInterface';

const MovieCardStyle = styled(Card)`
  img {
    aspect-ratio: 9/11;
  }
  .fa-star {
    color: #FF8A00;
  }
  .fa-thumbs-up {
    color: #00FF0A;
    background-color: #1F1F1F;
    border: 0.063rem solid #3A3B46;
  }
  .fa-thumbs-down {
    color: #FF1800;
    background-color: #1F1F1F;
    border: 0.063rem solid #3A3B46;
    transform: rotateY(180deg);
  }
`;
const RatingDiv = styled.div`
  margin-top: -1.688rem;
  margin-bottom: 0.313rem;
`;
function Movies({
  name, image, year, liked,
}: SearchProps) {
  return (
    <MovieCardStyle className="bg-transparent my-2">
      <Card.Img variant="top" src={image} className="rounded-3" />
      <RatingDiv className="d-flex justify-content-end me-2">
        <Card.Text className="fw-bold rating bg-white mb-0 px-2 rounded-5 small text-black">
          <FontAwesomeIcon icon={solid('star')} className="me-1 my-auto" size="xs" />
          <span>3.0</span>
        </Card.Text>
      </RatingDiv>
      <Card.Body className="px-0">
        <Card.Text className="d-flex justify-content-between align-items-center m-0 small text-light">
          {year}
          <FontAwesomeIcon
            icon={liked ? regular('thumbs-up') : regular('thumbs-down')}
            className="rounded-circle p-1 me-2"
            size="sm"
          />
        </Card.Text>
        <Card.Text>
          {name}
        </Card.Text>
      </Card.Body>
    </MovieCardStyle>
  );
}

export default Movies;
