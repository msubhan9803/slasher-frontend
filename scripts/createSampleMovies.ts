import { INestApplication } from '@nestjs/common';
import { MoviesService } from '../src/movies/providers/movies.service';
import { MovieActiveStatus, MovieType } from '../src/schemas/movie/movie.enums';
import { moviesFactory } from '../test/factories/movies.factory';
import { createApp } from './createApp';

async function createSampleTmdbMovies(app: INestApplication) {
  const moviesService = app.get<MoviesService>(MoviesService);

  const movies = [
    {
      deleted: 0,
      status: MovieActiveStatus.Active,
      type: MovieType.MovieDb,
      adult: false,
      releaseDate: new Date('2019-10-08T18:30:00.000+00:00'),
      backDropPath: '/jCCdt0e8Xe9ttvevD4S3TSMNdH.jpg',
      movieDbId: 338967,
      logo: '/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
      description: 'Columbus, Tallahassee, Wichita, and Little Rock move to the American '
        + 'heartland as they face off against evolved zombies, fellow survivors, and the growing '
        + 'pains of the snarky makeshift family.',
      name: 'Zombieland: Double Tap',
      popularity: 28.799,
      sort_name: 'Zombieland Double Tap',
      rating: 3.82,
    },
    {
      deleted: 0,
      status: MovieActiveStatus.Active,
      type: MovieType.MovieDb,
      adult: false,
      releaseDate: new Date('1991-11-21T18:30:00.000+00:00'),
      backDropPath: '/c49rFrkHc6P7eQYrE6irZhaWIxy.jpg',
      movieDbId: 2907,
      logo: '/m5573WSqdOJdJHoLv7vYBX4WAQq.jpg',
      description: 'When an evil doctor finds out Uncle Fester has been missing for 25 years, '
        + "he introduces a fake Fester in an attempt to get the Addams family's money. Wednesday "
        + 'has some doubts about the new uncle Fester, but the fake uncle adapts very well to the '
        + 'strange family.',
      popularity: 22.678,
      name: 'Addams Family',
      rating: 4.21,
    },
  ];

  for (const movie of movies) {
    await moviesService.create(moviesFactory.build(movie));
  }
}

(async () => {
  const app = await createApp();
  await createSampleTmdbMovies(app);
  app.close();
})();
