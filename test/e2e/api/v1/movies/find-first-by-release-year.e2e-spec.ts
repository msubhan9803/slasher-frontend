import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { userFactory } from '../../../../factories/user.factory';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { moviesFactory } from '../../../../factories/movies.factory';
import { MoviesService } from '../../../../../src/movies/providers/movies.service';
import { MovieActiveStatus } from '../../../../../src/schemas/movie/movie.enums';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';

describe('Movie / Find First By Release Year (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let moviesService: MoviesService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('GET /api/v1/movies/firstByReleaseYear', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/movies/firstByReleaseYear').expect(HttpStatus.UNAUTHORIZED);
    });

    it('responds with error message when an invalid year supplied', async () => {
      const year = '1111';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/movies/firstByReleaseYear?year=${year}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual({
        statusCode: 400,
        message: ['minimum year is >= 1895 and maximum year is <= 2099'],
        error: 'Bad Request',
      });
    });

    describe('When a valid year is supplied', () => {
      it('when the year is valid than expected response', async () => {
        const movie = await moviesService.create(
          moviesFactory.build({
            status: MovieActiveStatus.Active,
          }),
        );
        const year = Number(movie.sortReleaseDate.slice(0, 4));
        const response = await request(app.getHttpServer())
          .get(`/api/v1/movies/firstByReleaseYear?year=${year}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: movie.name,
          logo: null,
          releaseDate: movie.releaseDate.toISOString(),
          rating: 0,
        });
      });
    });
  });
});
