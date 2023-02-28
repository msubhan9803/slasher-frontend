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
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Movie / Create/Update `rating` for `MovierUserStatus` (e2e)', () => {
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

    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    user1 = await usersService.create(userFactory.build({ userName: 'Albert DARTH Skywalker' }));
    user1AuthToken = user1.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('PUT /api/v1/movies/:id/rating', () => {
    let movie;
    beforeEach(async () => {
      movie = await moviesService.create(
        moviesFactory.build({
          status: MovieActiveStatus.Active,
          logo: null,
        }),
      );
    });

    it('requires authentication', async () => {
      const movieId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).put(`/api/v1/movies/${movieId}/rating`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('create/update rating`', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/movies/${movie._id}/rating`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ rating: 3 });
      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body).toEqual({
        rating: 3,
        ratingUsersCount: 1,
        userData: {
          rating: 3,
        },
      });
    });

    describe('should update average rating in the movie`', () => {
      beforeEach(async () => {
        // Create a ratig by `activeUser`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/rating`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ rating: 3 });
        // Create a ratig by `user1`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/rating`)
          .auth(user1AuthToken, { type: 'bearer' })
          .send({ rating: 1 });
      });
      it('should expect rating to be average of two users', async () => {
        const updatedMovie = await moviesService.findById(movie.id, false);
        // Rating of movie should be 2 because Math.round((1+3)/2) = Math.round(2) = 2
        expect(updatedMovie.rating).toBe(2);
      });
    });

    describe('should update average rating (decimal case) in the movie`', () => {
      beforeEach(async () => {
        // Create a rating by `activeUser`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/rating`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ rating: 2 });
        // Create a rating by `user1`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/rating`)
          .auth(user1AuthToken, { type: 'bearer' })
          .send({ rating: 1 });
      });
      it('should expect rating to be average of two users', async () => {
        const updatedMovie = await moviesService.findById(movie.id, false);
        // Rating of movie should be 1.5
        expect(updatedMovie.rating).toBe(1.5);
      });
    });

    describe('validations', () => {
      it('movie does not exist', async () => {
        const nonExistingId = new mongoose.Types.ObjectId();
        const response = await request(app.getHttpServer())
          .put(`/api/v1/movies/${nonExistingId}/rating`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ rating: 3 });
      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({ message: 'Movie not found', statusCode: 404 });
      });

      it('rating should be defined in payload', async () => {
        const response = await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie.id}/rating`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({});
        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'rating should not be null or undefined',
            'rating must be an integer number',
            'rating must not be less than 1',
            'rating must not be greater than 5',
            'rating must be a number conforming to the specified constraints',
          ],
          statusCode: 400,
        });
      });

      it('should not accept values below 1', async () => {
        const rating = 0;
        const response = await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie.id}/rating`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ rating });
        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: ['rating must not be less than 1'],
          statusCode: 400,
        });
      });

      it('should not accept non-integer values', async () => {
        const rating = 1.5;
        const response = await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie.id}/rating`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ rating });
        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: ['rating must be an integer number'],
          statusCode: 400,
        });
      });

      it('should not accept values above 5', async () => {
        const rating = 6;
        const response = await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie.id}/rating`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ rating });
        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: ['rating must not be greater than 5'],
          statusCode: 400,
        });
      });
    });
  });
});
