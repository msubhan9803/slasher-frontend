import React from 'react';
import styled from 'styled-components';

interface PlayMovieProp {
  embedId: string | undefined;
}
const StyledMoviePlay = styled.div`
  aspect-ratio: 1.78;
`;
function PlayMovie({ embedId }: PlayMovieProp) {
  return (
    <StyledMoviePlay className="position-relative">
      <iframe
        width="100%"
        height="100%"
        className="rounded-2 position-relative"
        src={`https://www.youtube.com/embed/${embedId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </StyledMoviePlay>

  );
}

export default PlayMovie;
