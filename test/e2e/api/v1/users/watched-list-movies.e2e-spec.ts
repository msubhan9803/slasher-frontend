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
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';

describe('Watched List Movies (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let configService: ConfigService;
  let moviesService: MoviesService;
  let movieUserStatusModel: Model<MovieUserStatusDocument>;
  let blocksModel: Model<BlockAndUnblockDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    movieUserStatusModel = moduleRef.get<Model<MovieUserStatusDocument>>(getModelToken(MovieUserStatus.name));

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let movie1;
  let movie2;
  let movie3;
  let movie4;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    activeUser = await usersService.create(userFactory.build({ userName: 'Star Wars Fan' }));
    user1 = await usersService.create(userFactory.build({ userName: 'Abe Kenobi' }));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    movie1 = await moviesService.create(
      moviesFactory.build({
        status: MovieActiveStatus.Active,
        deleted: MovieDeletionStatus.NotDeleted,
        type: MovieType.MovieDb,
        movieDBId: 662728,
        name: 'bird-die',
      }),
    );
    movie2 = await moviesService.create(
      moviesFactory.build({
        status: MovieActiveStatus.Active,
        deleted: MovieDeletionStatus.NotDeleted,
        type: MovieType.MovieDb,
        movieDBId: 223344,
        name: 'alive',
      }),
    );
    movie3 = await moviesService.create(
      moviesFactory.build({
        status: MovieActiveStatus.Active,
        deleted: MovieDeletionStatus.NotDeleted,
        type: MovieType.MovieDb,
        movieDBId: 33344,
        name: 'cat-die',
      }),
    );
    movie4 = await moviesService.create(
      moviesFactory.build({
        status: MovieActiveStatus.Active,
        deleted: MovieDeletionStatus.NotDeleted,
        type: MovieType.MovieDb,
        movieDBId: 33544,
        name: 'alive2',
      }),
    );

    await movieUserStatusModel.create({
      name: 'movie user status1',
      userId: activeUser._id,
      movieId: movie1._id,
      favourite: 0,
      watched: 0,
      watch: 0,
      buy: 1,
    });
    await movieUserStatusModel.create({
      name: 'movie user status2',
      userId: activeUser._id,
      movieId: movie2._id,
      favourite: 0,
      watched: 1,
      watch: 0,
      buy: 0,
    });
    await movieUserStatusModel.create({
      name: 'movie user status3',
      userId: activeUser._id,
      movieId: movie3._id,
      favourite: 0,
      watched: 1,
      watch: 0,
      buy: 0,
    });
    await movieUserStatusModel.create({
      name: 'movie user status5',
      userId: user1._id,
      movieId: movie4._id,
      favourite: 0,
      watched: 1,
      watch: 0,
      buy: 0,
    });
  });

  describe('Get /api/v1/users/:userId/watched-list', () => {
    describe('User all the watched movies list', () => {
      it('get all the user watched movies list', async () => {
        const limit = 5;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/watched-list?limit=${limit}&&sortBy=name`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            name: movie2.name,
            logo: 'http://localhost:4444/placeholders/movie_poster.png',
            releaseDate: expect.any(String),
            rating: 0,
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            name: movie3.name,
            logo: 'http://localhost:4444/placeholders/movie_poster.png',
            releaseDate: expect.any(String),
            rating: 0,
          },
        ]);
      });

      it('returns the expected response when the user is not found', async () => {
        const nonExistentUserId = '5d1df8ebe9a186319c225cd6';
        const limit = 2;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${nonExistentUserId}/watched-list?limit=${limit}&&sortBy=name`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'User not found',
          statusCode: 404,
        });
      });

      it('when user is block than expected response.', async () => {
        const user0 = await usersService.create(userFactory.build());
        await blocksModel.create({
          from: activeUser.id,
          to: user0._id,
          reaction: BlockAndUnblockReaction.Block,
        });
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${user0.id}/watched-list?limit=${limit}&&sortBy=name`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          message: 'Request failed due to user block.',
          statusCode: 404,
        });
      });

      it('when name contains supplied than expected all movies response', async () => {
        const limit = 5;
        const nameContains = 'c';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/watched-list?limit=${limit}&sortBy=${'rating'}&nameContains=${nameContains}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toHaveLength(1);
      });

      it('when the startsWith is exist than expected response', async () => {
        const sortNameStartsWith = 'a';
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/watched-list?limit=${limit}&sortBy=${'name'}&startsWith=${sortNameStartsWith}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([{
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: movie2.name,
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: movie2.releaseDate.toISOString(),
          rating: 0,
        }]);
      });

      it('when startsWith is not exist and nameContains is exist than expected response', async () => {
        const nameContains = 'li';
        const sortNameStartsWith = 'b';
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/users/${activeUser.id}/watched-list?
            limit=${limit}&sortBy=${'name'}&nameContains=${nameContains}&startsWith=${sortNameStartsWith}`,
          )
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([]);
      });

      it('when startsWith is exist and nameContains is not exist than expected response', async () => {
        const nameContains = 'rr';
        const sortNameStartsWith = 'a';
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/users/${activeUser.id}/watched-list?
            limit=${limit}&sortBy=${'name'}&nameContains=${nameContains}&startsWith=${sortNameStartsWith}`,
          )
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([]);
      });

      it('when startsWith and nameContains is exists than expected response', async () => {
        const nameContains = 'li';
        const sortNameStartsWith = 'a';
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(
            `/api/v1/users/${activeUser.id}/watched-list?
            limit=${limit}&sortBy=${'name'}&nameContains=${nameContains}&startsWith=${sortNameStartsWith}`,
          )
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([{
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: movie2.name,
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: movie2.releaseDate.toISOString(),
          rating: 0,
        }]);
      });
    });

    describe('should NOT find watched list movies when users are *not* friends', () => {
      let user2;
      beforeEach(async () => {
        user2 = await usersService.create(userFactory.build({
          profile_status: ProfileVisibility.Private,
        }));
      });

      it('should not allow the watched list movies when users are *not* friends', async () => {
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${user2.id}/watched-list?limit=${limit}&&sortBy=name`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({ statusCode: 403, message: 'You must be friends with this user to perform this action.' });
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/watched-list?&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/watched-list?limit=${limit}&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 20', async () => {
        const limit = 21;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/watched-list?limit=${limit}&sortBy=${'releasedate'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 20');
      });

      it('sortBy should not be empty', async () => {
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/watched-list?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('sortBy should not be empty');
      });

      it('sortBy must be one of the following values: name, releaseDate, rating', async () => {
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/watched-list?limit=${limit}&sortBy=${'tests'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('sortBy must be one of the following values: name, releaseDate, rating');
      });

      it('name be shorter than or equal to 30 characters', async () => {
        const limit = 10;
        const nameContains = new Array(35).join('z');
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/watched-list?limit=${limit}&sortBy=${'releasedate'}&nameContains=${nameContains}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('nameContains must be shorter than or equal to 30 characters');
      });

      it('responds with error message when an invalid startsWith supplied', async () => {
        const startsWith = '@qw$re';
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/watch-list?limit=${limit}&sortBy=${'name'}&startsWith=${startsWith}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          statusCode: 400,
          message: ['startsWith must match /^[a-z0-9#]+$/ regular expression'],
          error: 'Bad Request',
        });
      });
    });
  });
});
