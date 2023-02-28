import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { MoviesService } from '../../../../../src/movies/providers/movies.service';
import { moviesFactory } from '../../../../factories/movies.factory';
import { MovieActiveStatus } from '../../../../../src/schemas/movie/movie.enums';
import { MovieUserStatusService } from '../../../../../src/movie-user-status/providers/movie-user-status.service';
import { MovieUserStatus, MovieUserStatusDocument } from '../../../../../src/schemas/movieUserStatus/movieUserStatus.schema';
import { MovieUserStatusFavorites } from '../../../../../src/schemas/movieUserStatus/movieUserStatus.enums';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Delete Movie User Status Favorite (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let moviesService: MoviesService;
  let movieUserStatusService: MovieUserStatusService;
  let movieUserStatusModel: Model<MovieUserStatusDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    movieUserStatusService = moduleRef.get<MovieUserStatusService>(MovieUserStatusService);
    movieUserStatusModel = moduleRef.get<Model<MovieUserStatusDocument>>(getModelToken(MovieUserStatus.name));

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let movie;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    movie = await moviesService.create(
      moviesFactory.build(
        {
          status: MovieActiveStatus.Active,
        },
      ),
    );
    await movieUserStatusModel.create({
      name: 'movie user status1',
      userId: activeUser._id,
      movieId: movie._id,
      favourite: 0,
      watched: 0,
      watch: 0,
      buy: 0,
    });
  });

  describe('DELETE /movies/:movieId/lists/favorite', () => {
    it('successfully delete a add movie user status favorite', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/movies/${movie.id}/lists/favorite`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual({ success: true });
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString());
      expect(movieUserStatus.favourite).toBe(MovieUserStatusFavorites.NotFavorite);
    });

    it('returns the expected response when the movie id is not found', async () => {
      const movieId = '6337f478980180f44e64487c';
      const response = await request(app.getHttpServer())
        .delete(`/movies/${movieId}/lists/favorite`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual({
        message: 'Movie not found',
        statusCode: 404,
      });
    });

    describe('Validation', () => {
      it('movieId must be a mongodb id', async () => {
        const movieId = '634912b22c2f4*5e0e62285';
        const response = await request(app.getHttpServer())
          .delete(`/movies/${movieId}/lists/favorite`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'movieId must be a mongodb id',
          ],
          statusCode: 400,
        });
      });
    });
  });
});
