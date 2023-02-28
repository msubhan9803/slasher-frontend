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
    user1 = await usersService.create(userFactory.build());
  });

  describe('DELETE /api/v1/movies/:id/gore-factor', () => {
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
      await request(app.getHttpServer()).delete(`/api/v1/movies/${movieId}/gore-factor`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('delete a goreFactor`', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/movies/${movie._id}/gore-factor`)
        .auth(activeUserAuthToken, { type: 'bearer' });
      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body).toEqual({
        goreFactorRating: 0,
        goreFactorRatingUsersCount: 0,
        userData: {
          goreFactorRating: 0,
        },
       });
    });

    describe('delete should return correct average `goreFactor` value when other goreFactor exist', () => {
      const avgGoreFactorByOtherUsers = 3;
      beforeEach(async () => {
        // create some MovieUserStatus records having goreFactorRating non-zero values
        await moviesService.createOrUpdateGoreFactorRating(movie.id, 5, activeUser.id);
        await moviesService.createOrUpdateGoreFactorRating(movie.id, avgGoreFactorByOtherUsers, user1.id);
      });

      it('delete a goreFactorRating`', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/movies/${movie._id}/gore-factor`)
          .auth(activeUserAuthToken, { type: 'bearer' });
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          goreFactorRating: avgGoreFactorByOtherUsers,
          goreFactorRatingUsersCount: 1, // because one user has voted
          userData: { goreFactorRating: 0 },
         });
      });
    });

    describe('validations', () => {
      it('movie does not exist', async () => {
        const nonExistingId = new mongoose.Types.ObjectId();
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/movies/${nonExistingId}/gore-factor`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ rating: 3 });
      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({ message: 'Movie not found', statusCode: 404 });
      });
    });
  });
});
