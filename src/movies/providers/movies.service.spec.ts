/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { AppModule } from '../../app.module';
import { MoviesService } from './movies.service';
import { moviesFactory } from '../../../test/factories/movies.factory';
import { MovieDocument } from '../../schemas/movie/movie.schema';
import movieDbId2907ApiCreditsResponse from '../../../test/fixtures/movie-db/moviedbid-2907-api-credits-response';
import movieDbId2907ApiVideosResponse from '../../../test/fixtures/movie-db/moviedbid-2907-api-videos-response';
import movieDbId2907ApiMainMovieResponse from '../../../test/fixtures/movie-db/moviedbid-2907-api-main-movie-response';
import movieDbId2907ApiConfigurationResponse from '../../../test/fixtures/movie-db/moviedbid-2907-api-configuration-response';
import movieDbId2907ExpectedFetchMovieDbDataReturnValue from
  '../../../test/fixtures/movie-db/moviedbid-2907-expected-fetchMovieDbData-return-value';
import { MovieActiveStatus, MovieType } from '../../schemas/movie/movie.enums';
import { dropCollections } from '../../../test/helpers/mongo-helpers';

const mockHttpService = () => ({
});

describe('MoviesService', () => {
  let app: INestApplication;
  let connection: Connection;
  let moviesService: MoviesService;
  let configService: ConfigService;
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
    configService = moduleRef.get<ConfigService>(ConfigService);
    httpService = moduleRef.get<HttpService>(HttpService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await dropCollections(connection);
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

  describe('#fetchMovieDbData', () => {
    it('fetch expected movie db data', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(
        (url: any) => {
          switch (url) {
            case 'https://api.themoviedb.org/3/movie/2907/credits?api_key='
              + `${configService.get<string>('MOVIE_DB_API_KEY')}&language=en-US`:
              return of({
                data: movieDbId2907ApiCreditsResponse,
                status: 200,
                statusText: '',
                headers: {},
                config: {},
              });
            case 'https://api.themoviedb.org/3/movie/2907/videos?api_key='
              + `${configService.get<string>('MOVIE_DB_API_KEY')}&language=en-US`:
              return of({
                data: movieDbId2907ApiVideosResponse,
                status: 200,
                statusText: '',
                headers: {},
                config: {},
              });
            case 'https://api.themoviedb.org/3/movie/2907?api_key='
              + `${configService.get<string>('MOVIE_DB_API_KEY')}&language=en-US&append_to_response=release_dates`:
              return of({
                data: movieDbId2907ApiMainMovieResponse,
                status: 200,
                statusText: '',
                headers: {},
                config: {},
              });
            case 'https://api.themoviedb.org/3/configuration?api_key='
              + `${configService.get<string>('MOVIE_DB_API_KEY')}`:
              return of({
                data: movieDbId2907ApiConfigurationResponse,
                status: 200,
                statusText: '',
                headers: {},
                config: {},
              });
            default:
              throw new Error(`unhandled url: ${url}`);
          }
        },
      );
      expect(await moviesService.fetchMovieDbData(2907)).toEqual(movieDbId2907ExpectedFetchMovieDbDataReturnValue);
    });
  });
});
