import { DiscoverMovieDto } from '../dto/discover-movie.dto';
import { MovieDbDto } from '../dto/movie-db.dto';

export const moviesFromMovieDB: DiscoverMovieDto[] = [{
  adult: false,
  backdrop_path: '/y5Z0WesTjvn59jP6yo459eUsbli.jpg',
  genre_ids: [
    27,
    53,
  ],
  id: 663712,
  original_language: 'en',
  original_title: 'Terrifier 5',
  overview: 'Test',
  popularity: 4139.734,
  poster_path: '/wRKHUqYGrp3PO91mZVQ18xlwYzW.jpg',
  release_date: new Date(),
  title: 'Terrifier 5',
  video: false,
  vote_average: 7,
  vote_count: 517,
}];

export const mockMovieDbCallResponse: MovieDbDto = {
  page: 1,
  results: moviesFromMovieDB,
  total_pages: 1,
  total_results: 1,
};

export const mockMaxLimitApiMockResponse: MovieDbDto = {
  page: 1,
  results: moviesFromMovieDB.map((item) => ({ ...item, release_date: new Date('2027-12-31') })),
  total_pages: 1,
  total_results: 1,
};
