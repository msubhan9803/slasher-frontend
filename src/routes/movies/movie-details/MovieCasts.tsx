import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import {
  Button, Card, Col, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { MovieCast } from '../../../types';

interface CastListProps {
  castList: CastLists[]
}
interface CastLists {
  profile_path: string;
  name: string;
  character: string,
}
export const StyledCast = styled(Row)`
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

function MovieCasts({ castList }: CastListProps) {
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

  if (!castList || castList.length === 0) { return null; }

  return (
    <div className="bg-dark p-3 rounded-2 mt-3">
      <h1 className="h2 fw-bold">Top billed cast</h1>
      <div className="d-flex align-items-center mt-3">
        <StyledSlideButton aria-label="chevron left icon" className="prev p-1 me-3 bg-transparent border-0 text-white" onClick={slideCastsLeft}>
          <FontAwesomeIcon icon={solid('chevron-left')} size="lg" />
        </StyledSlideButton>
        <StyledCast id="slideCasts" className="flex-nowrap w-100">
          {castList && castList.map((cast: MovieCast) => (
            <Col key={cast.name} xs={6} sm={3} md={2} lg={3} xl={2}>
              <Card className="bg-transparent border-0">
                <div className="casts-image">
                  <Card.Img variant="top" src={cast.profile_path} alt="top cast" className="w-100 h-100 rounded-3" style={{ objectFit: 'cover' }} />
                </div>
                <Card.Body className="px-0 pb-0">
                  <Card.Title className="fs-3 m-0">
                    {cast.name}
                  </Card.Title>
                  <Card.Text className="text-primary fs-5">
                    {cast.character}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </StyledCast>
        <StyledSlideButton aria-label="chevron right icon" className="next bg-transparent border-0 p-1 ms-3 text-white" onClick={slideCastsRight}>
          <FontAwesomeIcon icon={solid('chevron-right')} size="lg" />
        </StyledSlideButton>
      </div>
    </div>
  );
}

export default MovieCasts;
