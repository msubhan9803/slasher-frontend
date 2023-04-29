export const tmdbImagePrefix = {
  sm: 'https://image.tmdb.org/t/p/w220_and_h330_face',
  lg: 'https://image.tmdb.org/t/p/w300_and_h450_bestv2',
};
// Sample tmdb images:
// https://image.tmdb.org/t/p/w220_and_h330_face/lxHAgO3xkwabq6gIXAnzs6sibyF.jpg
// https://image.tmdb.org/t/p/w300_and_h450_bestv2/lzdK6sqDqBnj4xNSmJG7tF520i9.jpg

export const postMovieDataToMovieDBformat = (movie: any) => {
  if (!movie) { return null; }
  return ({
    _id: movie?._id,
    title: movie?.name,
    poster_path: tmdbImagePrefix.lg + movie.logo,
    release_date: movie?.releaseDate,
  });
};

export const hasMovieDetailsFields = (movie: any) => movie?._id || movie?.name || movie?.logo;
