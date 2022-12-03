import {
  Cast, MainData, VideoData,
} from './movies.service';

const moviesCasts: Cast[] = [{
  adult: false,
  gender: 2,
  id: 27888,
  known_for_department: 'Acting',
  name: 'Raul Julia',
  original_name: 'Raul Julia',
  popularity: 8.946,
  profile_path: '/rC9ALBVjGMWQEFtRiIS20Ps38dq.jpg',
  cast_id: 3,
  character: 'Gomez Addams',
  credit_id: '52fe4374c3a36847f80554c7',
  order: 0,
}];

const moviesVideo: VideoData = {
  id: 2907,
  results: [{
    iso_639_1: 'en',
    iso_3166_1: 'US',
    name: 'The Addams Family (1991) Trailer 2',
    key: 'PzzzdDW6HDo',
    site: 'YouTube',
    size: 480,
    type: 'Trailer',
    official: false,
    published_at: '2016-10-02T01:23:08.000Z',
    id: '58b76ea392514161320016a4',
  }],
};

const moviesMainData: MainData = {
  adult: false,
  backdrop_path: '/7OxGhxUYAdtuike29VMzEFxJx7y.jpg',
  belongs_to_collection: {
    id: 11716,
    name: 'Addams Family Collection',
    poster_path: '/2ZVopkpVBRkgY1G3iMWFmoo8TIa.jpg',
    backdrop_path: '/gS5yZLrSJ6uNbsz17xoxf70X2Ws.jpg',
  },
  budget: 30000000,
  genres: [
    {
      id: 35,
      name: 'Comedy',
    },
    {
      id: 14,
      name: 'Fantasy',
    },
  ],
  homepage: '',
  id: 2907,
  imdb_id: 'tt0101272',
  original_language: 'en',
  original_title: 'The Addams Family',
  overview: 'When a man claiming to be long-lost Uncle Fester reappears after 25 years lost,'
    + 'the family plans a celebration to wake the dead. But the kids barely have time to warm up the electric chair before'
    + "Morticia begins to suspect Fester is fraud when he can't recall any of the details of Fester's life.",
  popularity: 68.784,
  poster_path: 'https://image.tmdb.org/t/p/w300_and_h450_bestv2/qFf8anju5f2epI0my8RdwwIXFIP.jpg',
  production_companies: [
    {
      id: 41,
      logo_path: '/xAot4SSOIHiWQ2WEnVXYGR1lce9.png',
      name: 'Orion Pictures',
      origin_country: 'US',
      iso_3166_1: 'US',
    },
  ],
  production_countries: [
    {
      iso_3166_1: 'US',
      name: 'United States of America',
    },
  ],
  release_date: '1991-11-22',
  revenue: 191502426,
  runtime: 102,
  spoken_languages: [
    {
      iso_639_1: 'en',
      name: 'English',
    },
  ],
  status: 'Released',
  tagline: 'Weird Is Relative',
  title: 'The Addams Family',
  video: false,
  vote_average: 7.016,
  vote_count: 3763,
};

export const mockMovieDbCallResponse = {
  cast: moviesCasts, video: moviesVideo, mainData: moviesMainData,
};
