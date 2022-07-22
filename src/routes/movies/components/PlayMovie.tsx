import React from 'react';
import styled from 'styled-components';

interface Props {
  embedId: string;
}
const StyledMoviePlay = styled.iframe`
  aspect-ratio: 16/9;
`;
function PlayMovie({ embedId }: Props) {
  return (
    <StyledMoviePlay
      className="rounded-2 w-100"
      src={`https://www.youtube.com/embed/${embedId}`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}

export default PlayMovie;
