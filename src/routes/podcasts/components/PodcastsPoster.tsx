import React from 'react';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';

const PosterCardStyle = styled(Card)`
  .poster {
    aspect-ratio: 1;
    img {
      object-fit: cover;
    }
  }
  .small-text {
    display: -webkit-box;
    max-width: 12.5rem;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
function PodcastsPoster({ poster, name, description }: any) {
  return (
    <PosterCardStyle className="my-4 bg-transparent border-0">
      <div className="poster">
        <Card.Img variant="top" src={poster} className="w-100 h-100 rounded-4" />
      </div>
      <Card.Body className="px-0 pb-0">
        <Card.Text className="title h3 fw-bold">
          {name}
        </Card.Text>
        <Card.Text className="small-text h4 text-light">
          {description}
        </Card.Text>
      </Card.Body>
    </PosterCardStyle>
  );
}

export default PodcastsPoster;
