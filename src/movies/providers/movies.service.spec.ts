/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';

import { AppModule } from '../../app.module';
import { MoviesService } from './movies.service';
import { moviesFactory } from '../../../test/factories/movies.factory';
import { Movie, MovieDocument } from '../../schemas/movie/movie.schema';
import { mockMovieDbCallResponse, mockMaxLimitApiMockResponse } from './movies.service.mock';
import movieDbId2907ApiCreditsResponse from '../../../test/fixtures/movie-db/moviedbid-2907-api-credits-response';
import movieDbId2907ApiVideosResponse from '../../../test/fixtures/movie-db/moviedbid-2907-api-videos-response';
import movieDbId2907ApiMainMovieResponse from '../../../test/fixtures/movie-db/moviedbid-2907-api-main-movie-response';
import movieDbId2907ApiConfigurationResponse from '../../../test/fixtures/movie-db/moviedbid-2907-api-configuration-response';
import movieDbId2907ExpectedFetchMovieDbDataReturnValue from
  '../../../test/fixtures/movie-db/moviedbid-2907-expected-fetchMovieDbData-return-value';
import { MovieActiveStatus, MovieDeletionStatus, MovieType } from '../../schemas/movie/movie.enums';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { UsersService } from '../../users/providers/users.service';
import { userFactory } from '../../../test/factories/user.factory';
import { MovieUserStatus, MovieUserStatusDocument } from '../../schemas/movieUserStatus/movieUserStatus.schema';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';

const mockHttpService = () => ({
});

describe('MoviesService', () => {
  let app: INestApplication;
  let connection: Connection;
  let moviesService: MoviesService;
  let configService: ConfigService;
  let movie: MovieDocument;
  let httpService: HttpService;
  let movieModel: Model<MovieDocument>;
  let usersService: UsersService;
  let movieUserStatusModel: Model<MovieUserStatusDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        { provide: HttpService, useFactory: mockHttpService },
      ],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    httpService = moduleRef.get<HttpService>(HttpService);
    usersService = moduleRef.get<UsersService>(UsersService);
    movieModel = moduleRef.get<Model<MovieDocument>>(getModelToken(Movie.name));
    movieUserStatusModel = moduleRef.get<Model<MovieUserStatusDocument>>(getModelToken(MovieUserStatus.name));

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
    httpService = await app.get<HttpService>(HttpService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    movie = await moviesService.create(
      moviesFactory.build(),
    );
  });

  it('should be defined', () => {
    expect(moviesService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a movie', async () => {
      expect(await moviesService.findById(movie.id, false)).toBeTruthy();
    });
  });

  describe('#update', () => {
    it('finds the expected movie and update the details', async () => {
      const movieData = {
        name: 'movie 3',
        countryOfOrigin: 'USA',
      };
      const updatedMovie = await moviesService.update(movie.id, movieData);
      const reloadedMovie = await moviesService.findById(updatedMovie.id, false);
      expect(reloadedMovie.name).toEqual(movieData.name);
      expect(reloadedMovie.countryOfOrigin).toEqual(movieData.countryOfOrigin);
      expect(reloadedMovie.contentRating).toEqual(movie.contentRating);
    });
  });

  describe('#findById', () => {
    it('finds the expected movie details', async () => {
      const movieDetails = await moviesService.findById(movie.id, false);
      expect(movieDetails.name).toEqual(movie.name);
    });

    it('finds the expected movie details that has not deleted and active status', async () => {
      const movieData = await moviesService.create(
        moviesFactory.build({
          status: MovieActiveStatus.Active,
        }),
      );
      const movieDetails = await moviesService.findById(movieData.id, true);
      expect(movieDetails.name).toEqual(movieData.name);
    });
  });

  describe('#findFirstBySortName', () => {
    it('finds the expected movie when sort name prefix is lower case', async () => {
      const sortNameStartsWith = movie.sort_name.slice(0, 11).toLowerCase();
      const movieDetails = await moviesService.findFirstBySortName(sortNameStartsWith, false);
      expect(movieDetails.id).toEqual(movie.id);
    });

    it('finds the expected sort name, with capital case input', async () => {
      const sortNameStartsWith = movie.sort_name.slice(0, 11).toUpperCase();
      const movieDetails = await moviesService.findFirstBySortName(sortNameStartsWith, false);
      expect(movieDetails.id).toEqual(movie.id);
    });

    it('returns null if no movie exists with the given sort name prefix', async () => {
      const movieDetails = await moviesService.findFirstBySortName('usertestuser', false);
      expect(movieDetails).toBeNull();
    });
  });

  describe('#findFirstByReleaseYear', () => {
    beforeEach(async () => {
      for (let i = 0; i < 3; i += 1) {
        await moviesService.create(
          moviesFactory.build({ releaseDate: DateTime.fromJSDate(movie.releaseDate).plus({ days: i + 1 }).toJSDate() }),
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
            name: 'Alien',
            movieDBId: 551234,
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'Alien!',
            movieDBId: 551235,
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'Alien 2',
            movieDBId: 551230,
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'Alien: Containment',
            movieDBId: 551233,
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'b',
            movieDBId: 551224,
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'c',
            movieDBId: 551214,
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'd',
            movieDBId: 551219,
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'e',
            movieDBId: 551218,
          },
        ),
      );
      const limit = 10;
      const moviesList = await moviesService.findAll(limit, true, 'name');
      for (let i = 1; i < moviesList.length; i += 1) {
        expect(moviesList[i - 1].sort_name < moviesList[i].sort_name).toBe(true);
      }
      expect(moviesList).toHaveLength(8);
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
      for (let i = 0; i < moviesList.length - 1; i += 1) {
        expect(moviesList[i].sortReleaseDate > moviesList[i + 1].sortReleaseDate).toBe(true);
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
      const moviesList = await moviesService.findAll(limit, true, 'name', movieData.id, 'c');
      expect(moviesList).toHaveLength(1);
    });

    it('when sort_name startsWith supplied than expected response', async () => {
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'alive',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'albeli',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'aquaman',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'blue-whel',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'cat-die',
          },
        ),
      );
      const limit = 5;
      const moviesList = await moviesService.findAll(limit, true, 'name', null, null, null, 'a');
      expect(moviesList).toHaveLength(3);
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

  describe('#getMoviesDataMaxYearLimit', () => {
    it("Returns a lower limit than the given endYear, when endYear is higher than the API data's max end year", async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() => of({
        data: mockMaxLimitApiMockResponse,
        status: 200,
        statusText: '',
        headers: {},
        config: {},
      }));
      const endYear = 2040;
      const maxYearLimit = await moviesService.getMoviesDataMaxYearLimit(endYear);
      expect(maxYearLimit).toBe(2027);
    });

    it("Returns the given endYear when endYear is lower than the API data's max end year", async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() => of({
        data: mockMaxLimitApiMockResponse,
        status: 200,
        statusText: '',
        headers: {},
        config: {},
      }));
      const endYear = 2022;
      const maxYearLimit = await moviesService.getMoviesDataMaxYearLimit(endYear);
      expect(maxYearLimit).toBe(2022);
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
      expect(firstResults[1].name).toBe('Terrifier 5');
    });

    it('Check for insert the movie record in database for two subsequent years (multiple mocks)', async () => {
      const nextYear = DateTime.now().plus({ years: 1 });

      const limit = 10;
      jest.spyOn(httpService, 'get')
        // Below mock is meant for the consumption of `#getMoviesDataMaxYearLimit`
        .mockImplementationOnce(() => of({
          data: { results: { release_date: nextYear } },
          status: 202,
          statusText: '',
          headers: {},
          config: {},
        }))
        // Below mock is meant for the consumption of fetching current year movies
        .mockImplementationOnce(() => of({
          data: mockMaxLimitApiMockResponse,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }))
        // Below mock is meant for the consumption of next year movies
        .mockImplementationOnce(() => of({
          data: {
            ...mockMovieDbCallResponse,
            results: mockMovieDbCallResponse.results.map((item) => (
              {
                ...item,
                original_title: 'Terrifier 9',
                title: 'Terrifier 9',
                id: 551234,
                release_date: nextYear,
                total_pages: 2,
              }
            )),
          },
          status: 202,
          statusText: '',
          headers: {},
          config: {},
        }));
      // jest.spyOn(httpService, 'get').mockImplementation(mockFn);
      const startYear = new Date().getFullYear();
      const endYear = nextYear.year;
      expect(await moviesService.findAll(limit, false, 'name')).toHaveLength(1);
      await moviesService.syncWithTheMovieDb(startYear, endYear);
      const firstResults = await moviesService.findAll(limit, false, 'name');
      expect(firstResults).toHaveLength(3);

      expect(firstResults[0].movieDBId).toBe(123456);
      expect(firstResults[0].deleted).toBe(MovieDeletionStatus.Deleted);

      expect(firstResults[1].movieDBId).toBe(663712);
      expect(firstResults[1].deleted).toBe(MovieDeletionStatus.NotDeleted);

      expect(firstResults[2].movieDBId).toBe(551234);
      expect(firstResults[2].deleted).toBe(MovieDeletionStatus.NotDeleted);
    });

    describe('Test update and delete ways', () => {
      let startYear;
      let endYear;

      beforeEach(async () => {
        startYear = new Date().getFullYear();
        endYear = new Date().getFullYear();

        jest.spyOn(httpService, 'get').mockImplementation(() => of({
          data: mockMovieDbCallResponse,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }));
        await moviesService.syncWithTheMovieDb(startYear, endYear);
      });

      it('Check for update the movie record in database', async () => {
        const limit = 10;

        // We test movie records before making sync
        const beforeResults = await moviesService.findAll(limit, false, 'name');
        expect(beforeResults).toHaveLength(2);
        expect(beforeResults[1].name).toBe('Terrifier 5');
        expect(beforeResults[1].deleted).toBe(0);

        // Now we test for updating the changed movie record in MovieDb API
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
        await moviesService.syncWithTheMovieDb(startYear, endYear);
        const firstResults = await moviesService.findAll(limit, false, 'name');
        expect(firstResults).toHaveLength(2);

        expect(firstResults[1].name).toBe('Terrifier 2');
        expect(firstResults[1].deleted).toBe(0);
      });

      it('Check that there should be no duplicate movie record in database after sync', async () => {
        const limit = 10;

        // We test movie records before making sync
        const beforeResults = await moviesService.findAll(limit, false, 'name');
        expect(beforeResults).toHaveLength(2);
        expect(beforeResults[1].name).toBe('Terrifier 5');

        // Consider a case where MovieDb API returns movie record with `releaseDate` changed to 5 years in past
        jest.spyOn(httpService, 'get').mockImplementation(() => of({
          data: {
            ...mockMovieDbCallResponse,
            results: mockMovieDbCallResponse.results.map((item) => (
              { ...item, releaseDate: new Date().getFullYear() - 10 })),
          },
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }));
        await moviesService.syncWithTheMovieDb(startYear, endYear);

        expect(await movieModel.find({ name: 'Terrifier 5' })).toHaveLength(1);

        const allMovies = await moviesService.findAll(limit, false, 'name');
        expect(allMovies).toHaveLength(2);
      });

      it('Check if any movie has been deleted from movies db in our collection', async () => {
        const limit = 10;

        // We test movie records before making sync
        const beforeResults = await moviesService.findAll(limit, false, 'name');
        expect(beforeResults).toHaveLength(2);
        expect(beforeResults[1].name).toBe('Terrifier 5');
        expect(beforeResults[1].deleted).toBe(0);

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
        await moviesService.syncWithTheMovieDb(startYear, endYear);
        const firstResults = await moviesService.findAll(limit, false, 'name');
        expect(firstResults).toHaveLength(2);
        expect(firstResults[1].name).toBe('Terrifier 5');
        expect(firstResults[1].deleted).toBe(1);
      });
    });

    it('Check for update the movie record in database for two subsequent years (multiple mocks)', async () => {
      const nextYear = DateTime.now().plus({ years: 1 });

      const startYear = new Date().getFullYear();
      const endYear = nextYear.year;

      const movieData1 = await moviesService.create(
        moviesFactory.build({
          movieDBId: 663712,
          deleted: MovieDeletionStatus.NotDeleted,
        }),
      );
      const movieData2 = await moviesService.create(
        moviesFactory.build({
          movieDBId: 551234,
          deleted: MovieDeletionStatus.NotDeleted,
        }),
      );

      const limit = 10;
      jest.spyOn(httpService, 'get')
        // Below mock is meant for the consumption of `#getMoviesDataMaxYearLimit`
        .mockImplementationOnce(() => of({
          data: { results: { release_date: nextYear } },
          status: 202,
          statusText: '',
          headers: {},
          config: {},
        }))
        // Below mock is meant for the consumption of fetching current year movies
        .mockImplementationOnce(() => of({
          data: mockMaxLimitApiMockResponse,
          status: 200,
          statusText: '',
          headers: {},
          config: {},
        }))
        // Below mock is meant for the consumption of next year movies
        .mockImplementationOnce(() => of({
          data: {
            ...mockMovieDbCallResponse,
            results: mockMovieDbCallResponse.results.map((item) => (
              {
                ...item,
                original_title: 'Terrifier 9',
                title: 'Terrifier 9',
                id: 551234,
                release_date: nextYear,
                total_pages: 1,
              }
            )),
          },
          status: 202,
          statusText: '',
          headers: {},
          config: {},
        }));

      await moviesService.syncWithTheMovieDb(startYear, endYear);
      const firstResults = await moviesService.findAll(limit, false, 'name');
      expect(firstResults).toHaveLength(3);
      expect(firstResults[0].movieDBId).toBe(123456);
      expect(firstResults[0].deleted).toBe(MovieDeletionStatus.Deleted);

      expect(firstResults[1].movieDBId).toBe(movieData1.movieDBId);
      expect(firstResults[1].deleted).toBe(MovieDeletionStatus.NotDeleted);

      expect(firstResults[2].movieDBId).toBe(movieData2.movieDBId);
      expect(firstResults[2].deleted).toBe(MovieDeletionStatus.NotDeleted);
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

  describe('#MoviesIdsForUser', () => {
    let activeUser;
    let movie1;
    let movie2;
    let movie3;
    beforeEach(async () => {
      movie1 = await moviesService.create(
        moviesFactory.build({
          status: MovieActiveStatus.Active,
          deleted: MovieDeletionStatus.NotDeleted,
          type: MovieType.MovieDb,
          movieDBId: 662728,
        }),
      );
      movie2 = await moviesService.create(
        moviesFactory.build({
          status: MovieActiveStatus.Active,
          deleted: MovieDeletionStatus.NotDeleted,
          type: MovieType.MovieDb,
          movieDBId: 223344,
        }),
      );
      movie3 = await moviesService.create(
        moviesFactory.build({
          status: MovieActiveStatus.Active,
          deleted: MovieDeletionStatus.NotDeleted,
          type: MovieType.MovieDb,
          movieDBId: 33344,
        }),
      );
      activeUser = await usersService.create(userFactory.build());
    });

    describe('#getWatchedListMovieIdsForUser', () => {
      beforeEach(async () => {
        await movieUserStatusModel.create({
          name: 'movie user status1',
          userId: activeUser._id,
          movieId: movie1._id,
          favourite: 0,
          watched: 1,
          watch: 0,
          buy: 0,
        });
        await movieUserStatusModel.create({
          name: 'movie user status2',
          userId: activeUser._id,
          movieId: movie2._id,
          favourite: 0,
          watched: 1,
          watch: 0,
          buy: 0,
        });
        await movieUserStatusModel.create({
          name: 'movie user status3',
          userId: activeUser._id,
          movieId: movie3._id,
          favourite: 0,
          watched: 1,
          watch: 0,
          buy: 0,
        });
        await movieUserStatusModel.create({
          name: 'movie user status4',
          userId: activeUser._id,
          movieId: movie._id,
          favourite: 1,
          watched: 0,
          watch: 0,
          buy: 0,
        });
      });

      it('find watched list movieids for users', async () => {
        const movieIds = await moviesService.getWatchedListMovieIdsForUser(activeUser._id);
        expect(movieIds).toEqual([movie1._id, movie2._id, movie3._id]);
      });
    });

    describe('#getWatchListMovieIdsForUser', () => {
      beforeEach(async () => {
        await movieUserStatusModel.create({
          name: 'movie user status1',
          userId: activeUser._id,
          movieId: movie1._id,
          favourite: 0,
          watched: 0,
          watch: 1,
          buy: 0,
        });
        await movieUserStatusModel.create({
          name: 'movie user status2',
          userId: activeUser._id,
          movieId: movie2._id,
          favourite: 0,
          watched: 0,
          watch: 1,
          buy: 0,
        });
        await movieUserStatusModel.create({
          name: 'movie user status3',
          userId: activeUser._id,
          movieId: movie3._id,
          favourite: 0,
          watched: 0,
          watch: 1,
          buy: 0,
        });
        await movieUserStatusModel.create({
          name: 'movie user status4',
          userId: activeUser._id,
          movieId: movie._id,
          favourite: 1,
          watched: 0,
          watch: 0,
          buy: 0,
        });
      });

      it('find watch list movieids for users', async () => {
        const movieIds = await moviesService.getWatchListMovieIdsForUser(activeUser._id);
        expect(movieIds).toEqual([movie1._id, movie2._id, movie3._id]);
      });
    });

    describe('#getBuyListMovieIdsForUser', () => {
      beforeEach(async () => {
        await movieUserStatusModel.create({
          name: 'movie user status1',
          userId: activeUser._id,
          movieId: movie1._id,
          favourite: 0,
          watched: 0,
          watch: 0,
          buy: 1,
        });
        await movieUserStatusModel.create({
          name: 'movie user status2',
          userId: activeUser._id,
          movieId: movie2._id,
          favourite: 0,
          watched: 0,
          watch: 0,
          buy: 1,
        });
        await movieUserStatusModel.create({
          name: 'movie user status3',
          userId: activeUser._id,
          movieId: movie3._id,
          favourite: 0,
          watched: 0,
          watch: 0,
          buy: 1,
        });
        await movieUserStatusModel.create({
          name: 'movie user status4',
          userId: activeUser._id,
          movieId: movie._id,
          favourite: 1,
          watched: 0,
          watch: 0,
          buy: 0,
        });
      });

      it('find buy list movieids for users', async () => {
        const movieIds = await moviesService.getBuyListMovieIdsForUser(activeUser._id);
        expect(movieIds).toEqual([movie1._id, movie2._id, movie3._id]);
      });
    });

    describe('#getFavoriteListMovieIdsForUser', () => {
      beforeEach(async () => {
        await movieUserStatusModel.create({
          name: 'movie user status1',
          userId: activeUser._id,
          movieId: movie1._id,
          favourite: 0,
          watched: 0,
          watch: 0,
          buy: 1,
        });
        await movieUserStatusModel.create({
          name: 'movie user status2',
          userId: activeUser._id,
          movieId: movie2._id,
          favourite: 1,
          watched: 0,
          watch: 0,
          buy: 0,
        });
        await movieUserStatusModel.create({
          name: 'movie user status3',
          userId: activeUser._id,
          movieId: movie3._id,
          favourite: 1,
          watched: 0,
          watch: 0,
          buy: 0,
        });
        await movieUserStatusModel.create({
          name: 'movie user status4',
          userId: activeUser._id,
          movieId: movie._id,
          favourite: 1,
          watched: 0,
          watch: 0,
          buy: 0,
        });
      });

      it('find favorite list movieids for users', async () => {
        const movieIds = await moviesService.getFavoriteListMovieIdsForUser(activeUser._id);
        expect(movieIds).toEqual([movie2._id, movie3._id, movie._id]);
      });
    });
  });
});
