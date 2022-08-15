import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import styled from 'styled-components';

interface Props {
  movieTrailer: string[];
}

const StyledMovieTrailer = styled(Row)`
  overflow-x: auto;
  overflow-y: hidden;

  .trailer-image {
    aspect-ratio: 1.78;
  }
  &::-webkit-scrollbar {
    display: none;
  }

`;

function MovieTrailers({ movieTrailer }: Props) {
  const slideTrailerLeft = () => {
    const slider = document.getElementById('slideTrailer');
    if (slider !== null) {
      slider.scrollLeft -= 300;
    }
  };

  const slideTrailerRight = () => {
    const slider = document.getElementById('slideTrailer');
    if (slider !== null) {
      slider.scrollLeft += 300;
    }
  };
  return (
    <div className="bg-dark p-4 rounded-2 mt-3">
      <h1 className="h2 fw-bold">Trailers</h1>
      <div className="d-flex align-items-center mt-3">
        <Button className="text-white ps-0 prev bg-transparent border-0 shadow-none" onClick={slideTrailerLeft}>
          <FontAwesomeIcon icon={solid('chevron-left')} size="lg" />
        </Button>
        <StyledMovieTrailer
          id="slideTrailer"
          className="d-flex flex-nowrap w-100"
        >
          {movieTrailer.map((trailer: string) => (
            <Col sm={5} md={4} lg={6} xl={4} key={trailer}>
              <div className="trailer-image position-relative">
                <iframe
                  className="w-100 h-100 rounded-2 position-absolute"
                  src={`https://www.youtube.com/embed/${trailer}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </Col>
          ))}
        </StyledMovieTrailer>
        <Button className="text-white pe-0 next bg-transparent border-0 shadow-none" onClick={slideTrailerRight}>
          <FontAwesomeIcon icon={solid('chevron-right')} size="lg" />
        </Button>
      </div>
    </div>
  );
}

export default MovieTrailers;
