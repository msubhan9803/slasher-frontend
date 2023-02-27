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

describe('Movie / Create/Update `goreFactor` for `MovierUserStatus` (e2e)', () => {
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

  describe('PUT /api/v1/movies/:id/gore-factor', () => {
    let movie;
    beforeEach(async () => {
      movie = await moviesService.create(
        moviesFactory.build({
          status: MovieActiveStatus.Active,
          logo: null,
        }),
      );
    });

    it('create/update goreFactor`', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/movies/${movie._id}/gore-factor`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ goreFactorRating: 3 });
      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body).toEqual({
        goreFactorRating: 3,
        goreFactorRatingUsersCount: 1,
        userData: {
          goreFactorRating: 3,
        },
      });
    });

    describe('should update average rating in the movie (case 1)`', () => {
      beforeEach(async () => {
        // Create a `goreFactorRating` by `activeUser`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/gore-factor`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ goreFactorRating: 2 });
        // Create a `goreFactorRating` by `user1`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/gore-factor`)
          .auth(user1AuthToken, { type: 'bearer' })
          .send({ goreFactorRating: 2 });
      });
      it('should expect goreFactorRating to be average of two users', async () => {
        const updatedMovie = await moviesService.findById(movie.id, false);
        // goreFactorRating of movie should be 2 because Math.round((2+2)/2) = Math.round(4) = 2
        expect(updatedMovie.goreFactorRating).toBe(2);
      });
    });

    describe('should update average goreFactorRating (case 2 - decimal case) in the movie`', () => {
      beforeEach(async () => {
        // Create a `goreFactorRating` by `activeUser`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/gore-factor`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ goreFactorRating: 1 });
        // Create a `goreFactorRating` by `user1`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/gore-factor`)
          .auth(user1AuthToken, { type: 'bearer' })
          .send({ goreFactorRating: 2 });
      });
      it('should expect goreFactorRating to be average of two users', async () => {
        const updatedMovie = await moviesService.findById(movie.id, false);
        // goreFactorRating of movie should be 1.5
        expect(updatedMovie.goreFactorRating).toBe(1.5);
      });
    });

    describe('should update average goreFactorRating (case 3) in the movie`', () => {
      beforeEach(async () => {
        // Create a `goreFactorRating` by `activeUser`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/gore-factor`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ goreFactorRating: 1 });
        // Create a `goreFactorRating` by `user1`
        await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie._id}/gore-factor`)
          .auth(user1AuthToken, { type: 'bearer' })
          .send({ goreFactorRating: 1 });
      });
      it('should expect goreFactorRating to be average of two users', async () => {
        const updatedMovie = await moviesService.findById(movie.id, false);
        // goreFactorRating of movie should be 2 because Math.round((1+1)/2) = Math.round(1) = 1
        expect(updatedMovie.goreFactorRating).toBe(1);
      });
    });

    describe('validations', () => {
      it('movie does not exist', async () => {
        const nonExistingId = new mongoose.Types.ObjectId();
        const response = await request(app.getHttpServer())
          .put(`/api/v1/movies/${nonExistingId}/gore-factor`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ goreFactorRating: 3 });
      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({ message: 'Movie not found', statusCode: 404 });
      });

      it('goreFactorRating should be defined in payload', async () => {
        const response = await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie.id}/gore-factor`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({});
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'goreFactorRating should not be null or undefined',
            'goreFactorRating must be an integer number',
            'goreFactorRating must not be less than 1',
            'goreFactorRating must not be greater than 5',
            'goreFactorRating must be a number conforming to the specified constraints',
          ],
          statusCode: 400,
        });
    });

      it('should not accept values below 1', async () => {
        const goreFactorRating = 0;
        const response = await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie.id}/gore-factor`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ goreFactorRating });
        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: ['goreFactorRating must not be less than 1'],
          statusCode: 400,
        });
      });

      it('should not accept non-integer values', async () => {
        const goreFactorRating = 1.5;
        const response = await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie.id}/gore-factor`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ goreFactorRating });
        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: ['goreFactorRating must be an integer number'],
          statusCode: 400,
        });
      });

      it('should not accept values above 5', async () => {
        const goreFactorRating = 6;
        const response = await request(app.getHttpServer())
          .put(`/api/v1/movies/${movie.id}/gore-factor`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ goreFactorRating });
        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: ['goreFactorRating must not be greater than 5'],
          statusCode: 400,
        });
      });
    });
  });
});
