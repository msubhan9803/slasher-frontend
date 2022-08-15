import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import {
  Button, Card, Col, Row,
} from 'react-bootstrap';
import styled from 'styled-components';

interface Props {
  movieCasts: CastsProps[];
}
interface CastsProps {
  image: string;
  name: string;
  designation: string;
}
const StyledCast = styled(Row)`
  overflow-x: auto;
  overflow-y: hidden;

  .casts-image {
    aspect-ratio: 0.79;
  }
  &::-webkit-scrollbar {
    display: none;
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
    <div className="bg-dark p-4 rounded-2 mt-3">
      <h1 className="h2 fw-bold">Top billed cast</h1>
      <div className="d-flex align-items-center mt-3">
        <StyledSlideButton className="text-white ps-0 prev bg-transparent border-0 shadow-none" onClick={slideCastsLeft}>
          <FontAwesomeIcon icon={solid('chevron-left')} size="lg" />
        </StyledSlideButton>
        <StyledCast id="slideCasts" className="flex-nowrap">
          {movieCasts.map((cast: any) => (
            <Col key={cast.name} xs={6} sm={3} md={2} lg={3} xl={2}>
              <Card className="bg-transparent border-0">
                <div className="casts-image">
                  <Card.Img variant="top" src={cast.image} className="w-100 h-100 rounded-3" />
                </div>
                <Card.Body className="px-0 pb-0">
                  <Card.Title className="fs-3 m-0">
                    {cast.name}
                  </Card.Title>
                  <Card.Text className="text-primary fs-5">
                    {cast.designation}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </StyledCast>
        <StyledSlideButton className="text-white pe-0 next bg-transparent border-0 shadow-none" onClick={slideCastsRight}>
          <FontAwesomeIcon icon={solid('chevron-right')} size="lg" />
        </StyledSlideButton>
      </div>
    </div>
  );
}

export default MovieCasts;
