import React from 'react';

interface Props {
  movieTrailer: string[];
}

function MovieTrailers({ movieTrailer }: Props) {
  return (
    <div>
      {movieTrailer.map((trailer: string) => (
        <iframe
          key={trailer}
          style={{ aspectRatio: '16/9' }}
          className="rounded-2"
          src={`https://www.youtube.com/embed/${trailer}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ))}
    </div>
  );
}

export default MovieTrailers;
