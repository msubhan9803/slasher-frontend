import React from 'react';

interface Props {
  embedId: string;
}
function PlayMovie({ embedId }: Props) {
  return (
    <iframe
      className="rounded-2"
      width="100%"
      height="420"
      src={`https://www.youtube.com/embed/${embedId}`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}

export default PlayMovie;
