/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { DateTime } from 'luxon';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

import { AppModule } from '../../app.module';
import { MoviesService } from './movies.service';
import { moviesFactory } from '../../../test/factories/movies.factory';
import { MovieDocument } from '../../schemas/movie/movie.schema';
import { mockMovieDbCallResponse, mockMaxLimitApiMockResponse } from './movies.service.mock';
import { MovieActiveStatus, MovieType } from '../../schemas/movie/movie.enums';

const mockHttpService = () => ({
});

describe('MoviesService', () => {
  let app: INestApplication;
  let connection: Connection;
  let moviesService: MoviesService;
  let movie: MovieDocument;
  let httpService: HttpService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        { provide: HttpService, useFactory: mockHttpService },
      ],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    app = moduleRef.createNestApplication();
    await app.init();
    httpService = await app.get<HttpService>(HttpService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();
    movie = await moviesService.create(
      moviesFactory.build(),
    );
  });

  it('should be defined', () => {
    expect(moviesService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a movie', async () => {
      expect(await moviesService.findById(movie._id, false)).toBeTruthy();
    });
  });

  describe('#update', () => {
    it('finds the expected movie and update the details', async () => {
      const movieData = {
        name: 'movie 3',
        countryOfOrigin: 'USA',
      };
      const updatedMovie = await moviesService.update(movie._id, movieData);
      const reloadedMovie = await moviesService.findById(updatedMovie._id, false);
      expect(reloadedMovie.name).toEqual(movieData.name);
      expect(reloadedMovie.countryOfOrigin).toEqual(movieData.countryOfOrigin);
      expect(reloadedMovie.contentRating).toEqual(movie.contentRating);
    });
  });

  describe('#findById', () => {
    it('finds the expected movie details', async () => {
      const movieDetails = await moviesService.findById(movie._id, false);
      expect(movieDetails.name).toEqual(movie.name);
    });

    it('finds the expected movie details that has not deleted and active status', async () => {
      const movieData = await moviesService.create(
        moviesFactory.build({
          status: MovieActiveStatus.Active,
        }),
      );
      const movieDetails = await moviesService.findById(movieData._id, true);
      expect(movieDetails.name).toEqual(movieData.name);
    });
  });

  describe('#findFirstBySortName', () => {
    beforeEach(async () => {
      for (let i = 0; i < 3; i += 1) {
        await moviesService.create(
          moviesFactory.build(),
        );
      }
    });

    it('finds the expected sort name, with lower case input', async () => {
      const sortNameStartsWith = movie.sort_name.slice(0, 12).toLowerCase();
      const movieDetails = await moviesService.findFirstBySortName(sortNameStartsWith, false);
      expect(movieDetails.name.toLowerCase().startsWith(sortNameStartsWith.toLowerCase())).toBeTruthy();
    });

    it('finds the expected sort name, with capital case input', async () => {
      const sortNameStartsWith = movie.sort_name.slice(0, 12).toUpperCase();
      const movieDetails = await moviesService.findFirstBySortName(sortNameStartsWith, false);
      expect(movieDetails.name.toLowerCase().startsWith(sortNameStartsWith.toLowerCase())).toBeTruthy();
    });

    it('sort name is does not exist than expected response', async () => {
      const movieDetails = await moviesService.findFirstBySortName('usertestuser', false);
      expect(movieDetails).toBeNull();
    });
  });

  describe('#findFirstByReleaseYear', () => {
    beforeEach(async () => {
      for (let i = 0; i < 3; i += 1) {
        await moviesService.create(
          moviesFactory.build(),
        );
      }
    });

    it('finds the expected sort year', async () => {
      const releaseYear = movie.releaseDate.getFullYear();
      const movieDetails = await moviesService.findFirstByReleaseYear(releaseYear, false);
      expect(movieDetails.id).toEqual(movie.id);
    });

    it('year is does not exist than expected response', async () => {
      const movieDetails = await moviesService.findFirstByReleaseYear(1990, false);
      expect(movieDetails).toBeNull();
    });
  });

  describe('#findAll', () => {
    it('only includes movies of type MovieType.MovieDb', async () => {
      await moviesService.create(
        moviesFactory.build({ status: MovieActiveStatus.Active, name: 'a', type: MovieType.Free }),
      );
      await moviesService.create(
        moviesFactory.build({ status: MovieActiveStatus.Active, name: 'b', type: MovieType.MovieDb }),
      );

      const moviesList = await moviesService.findAll(2, true, 'name');
      expect(moviesList).toHaveLength(1);
    });

    it('when movies is sort by name than expected response', async () => {
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'a',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'b',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'c',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'd',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'e',
          },
        ),
      );
      const limit = 5;
      const moviesList = await moviesService.findAll(limit, true, 'name');
      for (let i = 1; i < moviesList.length; i += 1) {
        expect(moviesList[i - 1].sort_name < moviesList[i].sort_name).toBe(true);
      }
      expect(moviesList).toHaveLength(5);
    });

    it('when movies is sort by releaseDate than expected response', async () => {
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            releaseDate: DateTime.now().plus({ days: 1 }).toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            releaseDate: DateTime.now().plus({ days: 2 }).toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            releaseDate: DateTime.now().minus({ days: 2 }).toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            releaseDate: DateTime.now().minus({ days: 1 }).toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            releaseDate: DateTime.now().minus({ days: 3 }).toJSDate(),
          },

        ),
      );
      const limit = 5;
      const moviesList = await moviesService.findAll(limit, true, 'releaseDate');
      for (let i = 1; i < moviesList.length; i += 1) {
        expect(moviesList[i - 1].sortReleaseDate < moviesList[i].sortReleaseDate).toBe(true);
      }
      expect(moviesList).toHaveLength(5);
    });

    it('finds all the expected movie details that has deleted and active status', async () => {
      for (let index = 0; index < 4; index += 1) {
        await moviesService.create(
          moviesFactory.build(),
        );
      }
      const limit = 5;
      const moviesList = await moviesService.findAll(limit, false, 'name');
      expect(moviesList).toHaveLength(5);
    });

    it('when name contains supplied than expected response', async () => {
      const movieData = await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'a',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'b',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'c',
          },
        ),
      );
      const limit = 5;
      const moviesList = await moviesService.findAll(limit, true, 'name', movieData._id, 'c');
      expect(moviesList).toHaveLength(1);
    });

    it('when movies is sort by rating than expected response', async () => {
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            rating: 1,
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            rating: 1.5,
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            rating: 2,
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            rating: 2.5,
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            rating: 3,
          },
        ),
      );
      const limit = 5;
      const moviesList = await moviesService.findAll(limit, true, 'rating');
      for (let i = 1; i < moviesList.length; i += 1) {
        expect(moviesList[i].sortRating < moviesList[i - 1].sortRating).toBe(true);
      }
      expect(moviesList).toHaveLength(5);
    });

    describe('when `after` argument is supplied', () => {
      beforeEach(async () => {
        const rating = [1, 1.5, 2, 2.5, 3];
        for (let i = 0; i < 5; i += 1) {
          await moviesService.create(
            moviesFactory.build(
              {
                status: MovieActiveStatus.Active,
                rating: rating[i],
              },
            ),
          );
        }
      });
      it('sort by name returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResults = await moviesService.findAll(limit, true, 'name');
        const secondResults = await moviesService.findAll(limit, true, 'name', firstResults[limit - 1].id);
        expect(firstResults).toHaveLength(3);
        expect(secondResults).toHaveLength(2);
      });

      it('sort by release date returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResults = await moviesService.findAll(limit, true, 'releaseDate');
        const secondResults = await moviesService.findAll(limit, true, 'releaseDate', firstResults[limit - 1].id);
        expect(firstResults).toHaveLength(3);
        expect(secondResults).toHaveLength(2);
      });

      it('sort by rating returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResults = await moviesService.findAll(limit, true, 'rating');
        const secondResults = await moviesService.findAll(limit, true, 'rating', firstResults[limit - 1].id);
        expect(firstResults).toHaveLength(3);
        expect(secondResults).toHaveLength(2);
      });
    });
  });

  describe('#syncWithTheMovieDb', () => {
    it('Check for insert the movie record in database', async () => {
      const limit = 10;
      jest.spyOn(httpService, 'get').mockImplementation(() => of({
        data: mockMovieDbCallResponse,
        status: 202,
        statusText: '',
        headers: {},
        config: {},
      }));
      const startYear = new Date().getFullYear();
      const endYear = new Date().getFullYear();
      expect(await moviesService.findAll(limit, false, 'name')).toHaveLength(1);
      await moviesService.syncWithTheMovieDb(startYear, endYear);
      const firstResults = await moviesService.findAll(limit, false, 'name');
      expect(firstResults).toHaveLength(2);
      expect(firstResults[0].name).toBe('Terrifier 5');
    });

    it('Check for update the movie record in database', async () => {
      const limit = 10;
      jest.spyOn(httpService, 'get').mockImplementation(() => of({
        data: {
        ...mockMovieDbCallResponse,
        results: mockMovieDbCallResponse.results.map((item) => (
          { ...item, original_title: 'Terrifier 2', title: 'Terrifier 2' })),
        },
        status: 200,
        statusText: '',
        headers: {},
        config: {},
      }));
      const startYear = new Date().getFullYear();
      const endYear = new Date().getFullYear();
      await moviesService.syncWithTheMovieDb(startYear, endYear);
      const firstResults = await moviesService.findAll(limit, false, 'name');

      expect(firstResults[0].name).toBe('Terrifier 2');
      expect(firstResults[0].deleted).toBe(0);
    });

    it('Check if any movie has been deleted from movies db in our collection', async () => {
      const limit = 10;
      jest.spyOn(httpService, 'get').mockImplementation(() => of({
        data: {
        ...mockMovieDbCallResponse,
        results: [],
        },
        status: 200,
        statusText: '',
        headers: {},
        config: {},
      }));
      const startYear = new Date().getFullYear();
      const endYear = new Date().getFullYear();
      await moviesService.syncWithTheMovieDb(startYear, endYear);
      const firstResults = await moviesService.findAll(limit, false, 'name');
      expect(firstResults[0].deleted).toBe(1);
    });

    it('Check the start and end limit for the movies release date year', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() => of({
        data: mockMaxLimitApiMockResponse,
        status: 200,
        statusText: '',
        headers: {},
        config: {},
      }));
      const endYear = new Date().getFullYear();
      const maxYearLimit = await moviesService.getMoviesDataMaxYearLimit(endYear);
      expect(maxYearLimit).toBe(2027);
    });
  });
});
