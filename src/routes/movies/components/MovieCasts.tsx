import React from 'react';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';

interface Props {
  movieCasts: CastsProps[];
}
interface CastsProps {
  image: string;
  name: string;
  designation: string;
}
const StyledCast = styled.div`
  overflow-x: auto;
  overflow-y: hidden;

  img {
    width: 8.697rem;
    height: 8.744rem;
  }
`;
function MovieCasts({ movieCasts }: Props) {
  return (
    <StyledCast className="d-flex flex-nowrap">
      {movieCasts.map((cast: CastsProps) => (
        <div key={cast.name} className="me-2">
          <Card className="bg-transparent my-2 border-0">
            <Card.Img variant="top" src={cast.image} className="rounded-3" />
            <Card.Body className="px-0">
              <Card.Title className="h6 m-0">
                {cast.name}
              </Card.Title>
              <Card.Text className="text-primary small">
                {cast.designation}
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      ))}
    </StyledCast>
  );
}

export default MovieCasts;
