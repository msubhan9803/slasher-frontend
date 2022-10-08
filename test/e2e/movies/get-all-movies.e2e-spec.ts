import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { MoviesService } from '../../../src/movies/providers/movies.service';
import { moviesFactory } from '../../factories/movies.factory';
import { MovieActiveStatus } from '../../../src/schemas/movie/movie.enums';

describe('All Movies (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let moviesService: MoviesService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

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
    await connection.dropDatabase();

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    for (let index = 0; index < 5; index += 1) {
      await moviesService.create(
        moviesFactory.build(),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
          },
        ),
      );
    }
  });

  describe('All Movies Details', () => {
    it('when sortBy is name than expected all movies response', async () => {
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/movies?limit=${limit}&sortBy=${'name'}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(5);
    });

    it('when sortBy is releaseDate than expected all movies response', async () => {
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/movies?limit=${limit}&sortBy=${'releaseDate'}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(5);
    });

    describe('when `after` argument is supplied', () => {
      it('get expected first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResponse = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.status).toEqual(HttpStatus.OK);
        expect(firstResponse.body).toHaveLength(3);

        const secondResponse = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}&sortBy=${'name'}&after=${firstResponse.body[2]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.status).toEqual(HttpStatus.OK);
        expect(secondResponse.body).toHaveLength(2);
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/movies?&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 20', async () => {
        const limit = 21;
        const response = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}&sortBy=${'releasedate'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 20');
      });

      it('sortBy should not be empty', async () => {
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('sortBy should not be empty');
      });

      it('sortby allow only name and releasedate', async () => {
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}&sortBy=${'tests'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toBe('sortby allow only name and releasedate');
      });
    });
  });
});
