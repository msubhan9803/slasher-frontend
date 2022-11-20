import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { userFactory } from '../../factories/user.factory';
import { UsersService } from '../../../src/users/providers/users.service';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { moviesFactory } from '../../factories/movies.factory';
import { MoviesService } from '../../../src/movies/providers/movies.service';
import { MovieActiveStatus } from '../../../src/schemas/movie/movie.enums';
import { dropCollections } from '../../helpers/mongo-helpers';

describe('Movie / Find First By Sort Name (e2e)', () => {
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
  });

  describe('GET /movies/firstBySortName', () => {
    it('responds with error message when an invalid startsWith supplied', async () => {
      const startsWith = '@qw$re';
      const response = await request(app.getHttpServer())
        .get(`/movies/firstBySortName?startsWith=${startsWith}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual({
        statusCode: 400,
        message: ['startsWith must match /^[a-z0-9#]+$/ regular expression'],
        error: 'Bad Request',
      });
    });

    describe('When a valid startsWith is supplied', () => {
      it('when the startsWith is valid than expected response', async () => {
        const movie = await moviesService.create(
          moviesFactory.build({
            name: 'GrEaT MoVie #9',
            status: MovieActiveStatus.Active,
          }),
        );
        const sortNameStartsWith = 'great';
        const response = await request(app.getHttpServer())
          .get(`/movies/firstBySortName?startsWith=${sortNameStartsWith}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.sort_name).toEqual(movie.sort_name);
      });
    });
  });
});
