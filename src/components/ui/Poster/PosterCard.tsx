import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';

interface PosterProps {
  name: string;
  year: string;
  liked: boolean;
  rating?: number;
  poster?: string;
}
const PosterCardStyle = styled(Card)`
  .poster {
    aspect-ratio: 0.67;
    img {
      object-fit: cover;
    }
  }
  .fa-star {
    color: #FF8A00;
    width: 0.847rem;
    height: 0.808rem;
  }
  .fa-thumbs-up {
    color: #00FF0A;
    background-color: #1F1F1F;
    border: 1px solid #3A3B46;
    width: 0.847rem;
    height: 0.808rem;
  }
  .fa-thumbs-down {
    color: #FF1800;
    background-color: #1F1F1F;
    border: 1px solid #3A3B46;
    transform: rotateY(180deg);
    width: 0.847rem;
    height: 0.808rem;
  }
`;
const RatingDiv = styled.div`
  margin-top: -1.875rem;
`;
const StyledLikeButton = styled.div`
  width: 1.514rem;
  height: 1.514rem;
  border: 1px solid #3A3B46;
  background-color: #1F1F1F;
  .fa-thumbs-up {
    color: #00FF0A;
    width: 0.804rem;
    height: 0.805rem;
  }
  .fa-thumbs-down {
    color: #FF1800;
    transform: rotateY(180deg);
    width: 0.804rem;
    height: 0.805rem;
  }
`;

function PosterCard({
  name, poster, year, liked, rating,
}: PosterProps) {
  return (
    <PosterCardStyle className="bg-transparent border-0">
      <div className="poster">
        <Card.Img variant="top" src={poster} className="w-100 h-100 rounded-4" />
      </div>
      <RatingDiv className="d-flex justify-content-end me-2">
        <Card.Text className="rating bg-white mb-0 px-2 rounded-5 fs-5 text-black">
          <FontAwesomeIcon icon={solid('star')} className="me-1 my-auto" />
          <span className="h5">{rating}</span>
        </Card.Text>
      </RatingDiv>
      <Card.Body className="px-0 pb-4">
        <div className="fs-5 d-flex justify-content-between align-items-center m-0 text-light">
          {year}
          <StyledLikeButton className="align-items-center d-flex justify-content-center me-2 p-1 rounded-circle">
            <FontAwesomeIcon
              icon={liked ? regular('thumbs-up') : regular('thumbs-down')}
              className="border-0"
            />
          </StyledLikeButton>
        </div>
        <Card.Text className="h3 fw-bold mt-1">
          {name}
        </Card.Text>
      </Card.Body>
    </PosterCardStyle>
  );
}

PosterCard.defaultProps = {
  rating: null,
  poster: null,
};

export default PosterCard;
