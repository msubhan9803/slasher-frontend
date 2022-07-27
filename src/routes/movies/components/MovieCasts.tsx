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
    width: 7.938rem;
    height: 7.938rem;
  }
  &::-webkit-scrollbar {
    display: none;
}

  @media (max-width: 48rem) {
    img {
      width: 5rem;
      height: 5rem;
    }
  }
`;
const StyledSlideButton = styled(Button)`
  margin-top: -3.125rem;
`;

function MovieCasts({ movieCasts }: Props) {
  const slideCastsLeft = () => {
    const slider = document.getElementById('slideCasts');
    if (slider !== null) {
      slider.scrollLeft -= 300;
    }
  };

  const slideCastsRight = () => {
    const slider = document.getElementById('slideCasts');
    if (slider !== null) {
      slider.scrollLeft += 300;
    }
  };
  return (
    <div className="bg-dark p-3 rounded-2 mt-3">
      <h1 className="h3 fw-bold">Top billed cast</h1>
      <div className="d-flex align-items-center mt-3">
        <StyledSlideButton className="prev bg-transparent border-0 shadow-none" onClick={slideCastsLeft}>
          <FontAwesomeIcon icon={solid('chevron-left')} size="lg" />
        </StyledSlideButton>
        <StyledCast
          id="slideCasts"
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
        <StyledSlideButton className="next bg-transparent border-0 shadow-none" onClick={slideCastsRight}>
          <FontAwesomeIcon icon={solid('chevron-right')} size="lg" />
        </StyledSlideButton>
      </div>
    </div>
  );
}

export default MovieCasts;
