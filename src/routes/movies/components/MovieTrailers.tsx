import React from 'react';
import styled from 'styled-components';

interface Props {
  movieTrailer: string[];
}

const StyledMovieTrailer = styled.div`
  overflow-x: auto;
  overflow-y: hidden;

  iframe {
    aspect-ratio: 16/9;
  }
`;

function MovieTrailers({ movieTrailer }: Props) {
  return (
    <StyledMovieTrailer className="d-flex flex-nowrap">
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
  );
}

export default MovieTrailers;
