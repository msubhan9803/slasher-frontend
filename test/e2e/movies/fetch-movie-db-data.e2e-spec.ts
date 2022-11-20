import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AppModule } from '../../../src/app.module';
import { userFactory } from '../../factories/user.factory';
import { UsersService } from '../../../src/users/providers/users.service';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import movieDbId2907ExpectedFetchMovieDbDataReturnValue from
  '../../fixtures/movie-db/moviedbid-2907-expected-fetchMovieDbData-return-value';
import { MoviesService } from '../../../src/movies/providers/movies.service';
import { moviesFactory } from '../../factories/movies.factory';
import moviedbid2907ApiVideosResponse from '../../fixtures/movie-db/moviedbid-2907-api-videos-response';
import moviedbid2907ApiMainMovieResponse from '../../fixtures/movie-db/moviedbid-2907-api-main-movie-response';
import moviedbid2907ApiConfigurationResponse from '../../fixtures/movie-db/moviedbid-2907-api-configuration-response';
import moviedbid2907ApiCreditsResponse from '../../fixtures/movie-db/moviedbid-2907-api-credits-response';
import { dropCollections } from '../../helpers/mongo-helpers';

const mockHttpService = () => ({
});

describe('Movie / Fetch Movie Db Data (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let moviesService: MoviesService;
  let httpService: HttpService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        { provide: HttpService, useFactory: mockHttpService },
      ],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
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

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    await moviesService.create(
      moviesFactory.build({
        movieDBId: 2907,
      }),
    );
  });

  describe('GET /movies/movieDbData/:movieDBId', () => {
    it('get movie db data', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(
        (url: any) => {
          switch (url) {
            case 'https://api.themoviedb.org/3/movie/2907/credits?api_key='
              + `${configService.get<string>('MOVIE_DB_API_KEY')}&language=en-US`:
              return of({
                data: moviedbid2907ApiCreditsResponse,
                status: 200,
                statusText: '',
                headers: {},
                config: {},
              });
            case 'https://api.themoviedb.org/3/movie/2907/videos?api_key='
              + `${configService.get<string>('MOVIE_DB_API_KEY')}&language=en-US`:
              return of({
                data: moviedbid2907ApiVideosResponse,
                status: 200,
                statusText: '',
                headers: {},
                config: {},
              });
            case 'https://api.themoviedb.org/3/movie/2907?api_key='
              + `${configService.get<string>('MOVIE_DB_API_KEY')}&language=en-US&append_to_response=release_dates`:
              return of({
                data: moviedbid2907ApiMainMovieResponse,
                status: 200,
                statusText: '',
                headers: {},
                config: {},
              });
            case 'https://api.themoviedb.org/3/configuration?api_key='
              + `${configService.get<string>('MOVIE_DB_API_KEY')}`:
              return of({
                data: moviedbid2907ApiConfigurationResponse,
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
      const movieDBId = 2907;
      const response = await request(app.getHttpServer())
        .get(`/movies/movieDbData/${movieDBId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual(movieDbId2907ExpectedFetchMovieDbDataReturnValue);
    });
  });

  describe('Validation', () => {
    it('movieDBId should be a number', async () => {
      const movieDBId = 'a';
      const response = await request(app.getHttpServer())
        .get(`/movies/movieDbData/${movieDBId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body.message).toContain('movieDBId must be a number conforming to the specified constraints');
    });
  });
});
