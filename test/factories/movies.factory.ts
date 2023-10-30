import { Factory } from 'fishery';
import { MovieActiveStatus, MovieType } from '../../src/schemas/movie/movie.enums';
import { Movie } from '../../src/schemas/movie/movie.schema';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

const randomName = Math.random().toString(36).substring(2, 5);

export const moviesFactory = Factory.define<Partial<Movie>>(
  ({ sequence }) => new Movie({
    movieDBId: sequence,
    name: `Movie?! ${randomName}${sequence}`,
    status: MovieActiveStatus.Inactive, // default status is `InActive` for movieSchema
    trailerUrls: ['http://act.example.com/bell/achiever', 'https://www.example.net/'],
    countryOfOrigin: `country of origin ${sequence}`,
    contentRating: `content rating ${sequence}`,
    durationInMinutes: 31,
    releaseDate: new Date(),
    type: MovieType.MovieDb,
  }),
);

addFactoryToRewindList(moviesFactory);
