import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import { SearchProps } from '../SearchInterface';
import MoviePoster from '../../../images/movie-poster.jpg';
import LikeIconButton from '../../../components/ui/Poster/LikeIconButton';

const MovieCardStyle = styled(Card)`
  .movie-poster {
    aspect-ratio: 0.67;
    img {
      object-fit: cover;
    }
  }
  .fa-star {
    color: #FF8A00;
  }
  .fa-thumbs-up {
    color: #00FF0A;
    background-color: #1F1F1F;
    border: 1px solid #3A3B46;
  }
  .fa-thumbs-down {
    color: #FF1800;
    background-color: #1F1F1F;
    border: 1px solid #3A3B46;
    transform: rotateY(180deg);
  }
`;
const RatingDiv = styled.div`
  margin-top: -1.875rem;
`;
function Movies({
  name, year, liked,
}: SearchProps) {
  return (
    <MovieCardStyle className="bg-transparent my-2 border-0">
      <div className="movie-poster">
        <Card.Img variant="top" src={MoviePoster} className="w-100 h-100 rounded-3" />
      </div>
      <RatingDiv className="d-flex justify-content-end me-2">
        <Card.Text className="rating bg-white mb-0 px-2 rounded-5 small text-black">
          <FontAwesomeIcon icon={solid('star')} className="me-1 my-auto" size="sm" />
          <span>3.0</span>
        </Card.Text>
      </RatingDiv>
      <Card.Body className="px-0">
        <div className="small d-flex justify-content-between align-items-center m-0 text-light">
          {year}
          <LikeIconButton liked={liked} />
        </div>
        <Card.Text className="fw-bold mt-1">
          {name}
        </Card.Text>
      </Card.Body>
    </MovieCardStyle>
  );
}

export default Movies;
