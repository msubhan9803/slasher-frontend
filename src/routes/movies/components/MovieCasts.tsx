import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Card } from 'react-bootstrap';
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
    width: 7.894rem;
    height: 7.938rem;
  }
  &::-webkit-scrollbar {
    display: none;
}

  @media (max-width: 48rem) {
    img {
      width: 6.25rem;
      height: 6.249rem;
    }
  }
`;

function MovieCasts({ movieCasts }: Props) {
  const slideLeft = () => {
    const slider = document.getElementById('slider');
    if (slider !== null) {
      slider.scrollLeft -= 300;
    }
  };

  const slideRight = () => {
    const slider = document.getElementById('slider');
    if (slider !== null) {
      slider.scrollLeft += 300;
    }
  };
  return (
    <div className="d-flex align-items-center mt-3">
      <Button className="prev bg-transparent border-0 shadow-none" onClick={slideLeft}>
        <FontAwesomeIcon icon={solid('chevron-left')} size="lg" />
      </Button>
      <StyledCast
        id="slider"
        className="d-flex flex-nowrap"
      >
        {movieCasts.map((cast: any) => (
          <div key={cast.name} className="me-2">
            <Card className="bg-transparent border-0">
              <Card.Img variant="top" src={cast.image} className="rounded-3" />
              <Card.Body className="px-0 pb-0">
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
      <Button className="next bg-transparent border-0 shadow-none" onClick={slideRight}>
        <FontAwesomeIcon icon={solid('chevron-right')} size="lg" />
      </Button>
    </div>
  );
}

export default MovieCasts;
