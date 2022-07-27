import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import { SearchProps } from '../SearchInterface';
import moviePoster from '../../../images/movie-poster.svg';

const MovieCardStyle = styled(Card)`
  img {
    aspect-ratio: 0.83;
  }
  .fa-star {
    color: #FF8A00;
  }
`;
const RatingDiv = styled.div`
  margin-top: -1.688rem;
  margin-bottom: 0.313rem;
`;
const StyledLikeButton = styled.div`
  width: 1.514rem;
  height: 1.514rem;
  border: 0.063rem solid #3A3B46;
  background-color: #1F1F1F;
  .fa-thumbs-up {
    color: #00FF0A;
  }
  .fa-thumbs-down {
    color: #FF1800;
    transform: rotateY(180deg);
  }
  .fa-sm {
    width: 0.804rem;
    height: 0.805rem;
  }
`;
function Movies({
  name, year, liked,
}: SearchProps) {
  return (
    <MovieCardStyle className="bg-transparent my-2 border-0">
      <Card.Img variant="top" src={moviePoster} className="rounded-3" />
      <RatingDiv className="d-flex justify-content-end me-2">
        <Card.Text className="fw-bold rating bg-white mb-0 px-2 rounded-5 small text-black">
          <FontAwesomeIcon icon={solid('star')} className="me-1 my-auto" size="xs" />
          <span>3.0</span>
        </Card.Text>
      </RatingDiv>
      <Card.Body className="px-0">
        <Card.Text className="d-flex justify-content-between align-items-center m-0 small text-light">
          {year}
          <StyledLikeButton className="align-items-center d-flex justify-content-center me-2 p-1 rounded-circle">
            <FontAwesomeIcon
              icon={liked ? regular('thumbs-up') : regular('thumbs-down')}
              size="sm"
            />
          </StyledLikeButton>
        </Card.Text>
        <Card.Text className="fw-bold">
          {name}
        </Card.Text>
      </Card.Body>
    </MovieCardStyle>
  );
}

export default Movies;
