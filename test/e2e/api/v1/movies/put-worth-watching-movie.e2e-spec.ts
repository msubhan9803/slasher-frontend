import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { moviesFactory } from '../../../../factories/movies.factory';
import { MoviesService } from '../../../../../src/movies/providers/movies.service';
import { userFactory } from '../../../../factories/user.factory';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { MovieActiveStatus } from '../../../../../src/schemas/movie/movie.enums';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { WorthWatchingStatus } from '../../../../../src/schemas/movieUserStatus/movieUserStatus.enums';

describe('Movie / Create/Update `worthWatching` for `MovierUserStatus` (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let moviesService: MoviesService;
  let user1: UserDocument;
  let user1AuthToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    configService = moduleRef.get<ConfigService>(ConfigService);
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
    user1 = await usersService.create(userFactory.build({ userName: 'Albert DARTH Skywalker' }));
    user1AuthToken = user1.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('PUT /api/v1/movies/:id/worth-watching', () => {
    let movie;
    beforeEach(async () => {
      movie = await moviesService.create(
        moviesFactory.build({
          status: MovieActiveStatus.Active,
          logo: null,
        }),
      );
    });

    it('create/update worthWatching`', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/movies/${movie._id}/worth-watching`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ worthWatching: WorthWatchingStatus.Up });
      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        buy: 0,
        createdAt: expect.any(String),
        deleted: 0,
        favourite: 0,
        goreFactorRating: 0,
        movieId: movie.id,
        name: null,
        rating: 0,
        ratingStatus: 0,
        status: 1,
        updatedAt: expect.any(String),
        userId: activeUser.id,
        watch: 0,
        watched: 0,
        worthWatching: WorthWatchingStatus.Up,
      });
    });

    describe('should update average worthWatching in the movie (case 1: UP + UP)`', () => {
      beforeEach(async () => {
        // Create a `worthWatching` by `activeUser`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/worth-watching`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ worthWatching: WorthWatchingStatus.Up });
        // Create a `worthWatching` by `user1`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/worth-watching`)
          .auth(user1AuthToken, { type: 'bearer' })
          .send({ worthWatching: WorthWatchingStatus.Up });
      });
      it('should expect worthWatching to be average of two users', async () => {
        const updatedMovie = await moviesService.findById(movie.id, false);
        // worthWatching of movie should be 2 because Math.round((2+2)/2) = Math.round(4) = 2
        // we're expecting `WorthWatchingStatus.Up` as it has value 2
        expect(updatedMovie.worthWatching).toBe(WorthWatchingStatus.Up);
      });
    });

    describe('should update average worthWatching (case 2: DOWN + UP) in the movie`', () => {
      beforeEach(async () => {
        // Create a `worthWatching` by `activeUser`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/worth-watching`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ worthWatching: WorthWatchingStatus.Down });
        // Create a `worthWatching` by `user1`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/worth-watching`)
          .auth(user1AuthToken, { type: 'bearer' })
          .send({ worthWatching: WorthWatchingStatus.Up });
      });
      it('should expect worthWatching to be average of two users', async () => {
        const updatedMovie = await moviesService.findById(movie.id, false);
        // worthWatching of movie should be 2 because Math.round((1+2)/2) = Math.round(1.5) = 2
        // we're expecting `WorthWatchingStatus.Up` as it has value 2
        expect(updatedMovie.worthWatching).toBe(WorthWatchingStatus.Up);
      });
    });

    describe('should update average worthWatching (case 3: DOWN + DOWN ) in the movie`', () => {
      beforeEach(async () => {
        // Create a `worthWatching` by `activeUser`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/worth-watching`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ worthWatching: WorthWatchingStatus.Down });
        // Create a `worthWatching` by `user1`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/worth-watching`)
          .auth(user1AuthToken, { type: 'bearer' })
          .send({ worthWatching: WorthWatchingStatus.Down });
      });
      it('should expect worthWatching to be average of two users', async () => {
        const updatedMovie = await moviesService.findById(movie.id, false);
        // worthWatching of movie should be 2 because Math.round((1+1)/2) = Math.round(1) = 1
        // we're expecting `WorthWatchingStatus.Down` as it has value 1
        expect(updatedMovie.worthWatching).toBe(WorthWatchingStatus.Down);
      });
    });

    describe('validations', () => {
      it('movie does not exist', async () => {
        const nonExistingId = new mongoose.Types.ObjectId();
        const response = await request(app.getHttpServer())
          .put(`/api/v1/movies/${nonExistingId}/worth-watching`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ worthWatching: WorthWatchingStatus.Up });
      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({ message: 'Movie not found', statusCode: 404 });
      });

      it('should not accept values below 1', async () => {
        // Invalid value (one must use delete api instead to set this value to `WorthWatchingStatus.NoRating`)
        const worthWatching = 0;
        const response = await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie.id}/worth-watching`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ worthWatching });
        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: ['worthWatching must not be less than 1'],
          statusCode: 400,
        });
      });

      it('should not accept non-integer values', async () => {
        const worthWatching = 1.5;
        const response = await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie.id}/worth-watching`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ worthWatching });
        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: ['worthWatching must be an integer number'],
          statusCode: 400,
        });
      });

      it('should not accept values above 2', async () => {
        const worthWatching = 3;
        const response = await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie.id}/worth-watching`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ worthWatching });
        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: ['worthWatching must not be greater than 2'],
          statusCode: 400,
        });
      });
    });
  });
});
