import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User, UserDocument } from '../../../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import getMovieReviewsResponse from '../../../../fixtures/feed-post/find-movie-reviews.response';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { MoviesService } from '../../../../../src/movies/providers/movies.service';
import { moviesFactory } from '../../../../factories/movies.factory';
import { MovieActiveStatus } from '../../../../../src/schemas/movie/movie.enums';
import { PostType } from '../../../../../src/schemas/feedPost/feedPost.enums';
import { MovieUserStatus, MovieUserStatusDocument } from '../../../../../src/schemas/movieUserStatus/movieUserStatus.schema';

describe('Feed-Post / Find Movie Reviews (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let moviesService: MoviesService;
  let user1: User;
  let user0: User;
  let user2: User;
  let user3: User;
  let movieUserStatusModel: Model<MovieUserStatusDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    movieUserStatusModel = moduleRef.get<Model<MovieUserStatusDocument>>(getModelToken(MovieUserStatus.name));

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
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
    user1 = await usersService.create(userFactory.build());
    user0 = await usersService.create(userFactory.build());
    user2 = await usersService.create(userFactory.build());
    user3 = await usersService.create(userFactory.build());
    movie = await moviesService.create(
      moviesFactory.build(
        {
          status: MovieActiveStatus.Active,
        },
      ),
    );

    await feedPostsService.create(
      feedPostFactory.build({
        userId: activeUser.id,
        movieId: movie._id,
        postType: PostType.MovieReview,
      }),
    );
    await feedPostsService.create(
      feedPostFactory.build({
        userId: user0._id,
        movieId: movie._id,
        postType: PostType.MovieReview,
      }),
    );
    await feedPostsService.create(
      feedPostFactory.build({
        userId: user1._id,
        movieId: movie._id,
        postType: PostType.MovieReview,
      }),
    );

    await movieUserStatusModel.create({
      name: 'movie user status1',
      userId: activeUser._id,
      movieId: movie._id,
      goreFactorRating: 4,
      worthWatching: 1,
      rating: 4,
    });
    await movieUserStatusModel.create({
      name: 'movie user status2',
      userId: user0._id,
      movieId: movie._id,
      goreFactorRating: 3,
      worthWatching: 1,
      rating: 4,
    });
  });

  describe('GET /api/v1/feed-posts', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get(`/api/v1/feed-posts/${movie.id}/reviews`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns the expected feed movie reviews response', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-posts/${movie.id}/reviews?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      for (let i = 1; i < response.body.length; i += 1) {
        expect(response.body[i].createdAt < response.body[i - 1].createdAt).toBe(true);
      }
      expect(response.body).toEqual(getMovieReviewsResponse);
    });

    describe('when `before` argument is supplied', () => {
      beforeEach(async () => {
          await feedPostsService.create(
            feedPostFactory.build({
              userId: user2._id,
              movieId: movie._id,
              postType: PostType.MovieReview,
            }),
          );
          await feedPostsService.create(
            feedPostFactory.build({
              userId: user3._id,
              movieId: movie._id,
              postType: PostType.MovieReview,
            }),
          );
          await movieUserStatusModel.create({
            userId: user2._id,
            movieId: movie._id,
            goreFactorRating: 2,
            worthWatching: 2,
            rating: 4,
          });
          await movieUserStatusModel.create({
            userId: user3._id,
            movieId: movie._id,
            goreFactorRating: 4,
            worthWatching: 1,
            rating: 3,
          });
      });
      it('get expected first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResponse = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${movie.id}/reviews?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.body).toHaveLength(3);
        for (let index = 1; index < firstResponse.body.length; index += 1) {
          expect(firstResponse.body[index].createdAt < firstResponse.body[index - 1].createdAt).toBe(true);
        }

        const secondResponse = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${movie.id}/reviews?limit=${limit}&before=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.body).toHaveLength(2);
        for (let index = 1; index < secondResponse.body.length; index += 1) {
          expect(secondResponse.body[index].createdAt < secondResponse.body[index - 1].createdAt).toBe(true);
        }
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${movie.id}/reviews`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${movie.id}/reviews?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 30', async () => {
        const limit = 31;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${movie.id}/reviews?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 30');
      });

      it('`before` must match regular expression', async () => {
        const limit = 3;
        const before = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${movie.id}/reviews?limit=${limit}&before=${before}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain(
          'before must be a mongodb id',
        );
      });

      it('when feed post is not found than expected feed post response', async () => {
        const limit = 5;
        const movieId = '634fc8d86a5897b88a2d9753';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${movieId}/reviews?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.message).toBe('Movie not found');
      });
    });
  });
});
