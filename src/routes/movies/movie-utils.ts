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
    type: 'movie',
  });
};
export const postBookDataToBookDBformat = (book: any) => {
  if (!book) { return null; }
  return ({
    _id: book?._id,
    title: book?.name,
    poster_path: book.coverImage.image_path,
    release_date: book?.publishDate,
    type: 'book',
  });
};

export const showMoviePoster = (movie: any, postType: string | undefined) => {
  const moviePosterDetails = movie?._id || movie?.name || movie?.logo;
  const isNotMovieReview = postType !== 'review';
  return moviePosterDetails && isNotMovieReview;
};
export const showBookPoster = (book: any, postType: string | undefined) => {
  const bookPosterDetails = book?._id || book?.name || book?.coverImage?.image_path;
  const isNotBookReview = postType !== 'review';
  return bookPosterDetails && isNotBookReview;
};
