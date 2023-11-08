/* eslint-disable max-len */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { userFactory } from '../../../../factories/user.factory';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { moviesFactory } from '../../../../factories/movies.factory';
import { MovieActiveStatus, MovieDeletionStatus, MovieType } from '../../../../../src/schemas/movie/movie.enums';
import { MoviesService } from '../../../../../src/movies/providers/movies.service';
import { MovieUserStatus, MovieUserStatusDocument } from '../../../../../src/schemas/movieUserStatus/movieUserStatus.schema';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Count Movie List (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let moviesService: MoviesService;
  let movieUserStatusModel: Model<MovieUserStatusDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    movieUserStatusModel = moduleRef.get<Model<MovieUserStatusDocument>>(getModelToken(MovieUserStatus.name));

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let movie1;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(userFactory.build({ userName: 'Star Wars Fan' }));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    movie1 = await moviesService.create(
      moviesFactory.build({
        status: MovieActiveStatus.Active,
        deleted: MovieDeletionStatus.NotDeleted,
        type: MovieType.MovieDb,
        movieDBId: 662728,
        name: 'bird',
      }),
    );
  });

  describe('Get /api/v1/users/:userId/movie-list-count', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get(`/api/v1/users/${activeUser.id}/movie-list-count`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('count for movie list', () => {
      it('count for watch movie list', async () => {
        await movieUserStatusModel.create({
          name: 'movie user status1',
          userId: activeUser._id,
          movieId: movie1._id,
          favourite: 0,
          watched: 0,
          watch: 1,
          buy: 0,
        });
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/movie-list-count?type=watch`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.text).toBe('1');
      });

      it('count for watched movie list', async () => {
        for (let index = 0; index < 2; index += 1) {
          await movieUserStatusModel.create({
            name: 'movie user status1',
            userId: activeUser._id,
            movieId: movie1._id,
            favourite: 0,
            watched: 1,
            watch: 0,
            buy: 0,
          });
        }
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/movie-list-count?type=watched`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.text).toBe('2');
      });

      it('count for favorite movie list', async () => {
        for (let index = 0; index < 3; index += 1) {
          await movieUserStatusModel.create({
            name: 'movie user status1',
            userId: activeUser._id,
            movieId: movie1._id,
            favourite: 1,
            watched: 0,
            watch: 0,
            buy: 0,
          });
        }
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/movie-list-count?type=favorite`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.text).toBe('3');
      });

      it('count for buy movie list', async () => {
        for (let index = 0; index < 4; index += 1) {
          await movieUserStatusModel.create({
            name: `movie user status${index}`,
            userId: activeUser._id,
            movieId: movie1._id,
            favourite: 0,
            watched: 0,
            watch: 0,
            buy: 1,
          });
          }
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/movie-list-count?type=buy`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.text).toBe('4');
      });
    });

    describe('Validation', () => {
      it('userId must be a mongodb id', async () => {
        const userId = 'not-a-mongo-id';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${userId}/movie-list-count?type=watch`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId must be a mongodb id',
        );
      });

      it('list type should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/movie-list-count?`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('type should not be empty');
      });

      it('list type must be valid', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/movie-list-count?&type=SOME_BAD_VALUE`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('type must be one of the following values: watch, watched, favorite, buy');
      });
    });
  });
});
