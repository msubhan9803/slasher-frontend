import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';

interface Props {
  movieTrailer: string[];
}

const StyledMovieTrailer = styled.div`
  overflow-x: auto;
  overflow-y: hidden;

  iframe {
    aspect-ratio: 240/135;
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
    <div className="bg-dark p-3 rounded-2 mt-3">
      <h1 className="h3 fw-bold">Trailers</h1>
      <div className="d-flex align-items-center mt-3">
        <Button className="prev bg-transparent border-0 shadow-none" onClick={slideTrailerLeft}>
          <FontAwesomeIcon icon={solid('chevron-left')} size="lg" />
        </Button>
        <StyledMovieTrailer
          id="slideTrailer"
          className="d-flex flex-nowrap"
        >
          {movieTrailer.map((trailer: string) => (
            <iframe
              key={trailer}
              className="rounded-2 me-2"
              src={`https://www.youtube.com/embed/${trailer}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ))}
        </StyledMovieTrailer>
        <Button className="next bg-transparent border-0 shadow-none" onClick={slideTrailerRight}>
          <FontAwesomeIcon icon={solid('chevron-right')} size="lg" />
        </Button>
      </div>
    </div>
  );
}

export default MovieTrailers;
