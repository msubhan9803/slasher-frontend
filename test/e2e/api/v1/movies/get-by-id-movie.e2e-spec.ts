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
import { MovieActiveStatus, MovieType } from '../../../../../src/schemas/movie/movie.enums';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { WorthWatchingStatus } from '../../../../../src/types';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { PostType } from '../../../../../src/schemas/feedPost/feedPost.enums';

describe('GET Movie (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let moviesService: MoviesService;
  let user1: UserDocument;
  let feedPostsService: FeedPostsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
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
  });

  describe('GET /api/v1/movies/:id', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
      user1 = await usersService.create(userFactory.build());
    });

    describe('Find a movie by id', () => {
      it('requires authentication', async () => {
        const movieId = new mongoose.Types.ObjectId();
        await request(app.getHttpServer()).get(`/api/v1/movies/${movieId}`).expect(HttpStatus.UNAUTHORIZED);
      });

      it('returns the expected movie details', async () => {
        const movie = await moviesService.create(
          moviesFactory.build({
            status: MovieActiveStatus.Active,
            logo: null,
          }),
        );
        const response = await request(app.getHttpServer())
          .get(`/api/v1/movies/${movie._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          movieDBId: 1,
          rating: 0,
          goreFactorRating: 0,
          userData: {
            goreFactorRating: 0,
            rating: 0,
            worthWatching: 0,
          },
          worthWatching: 0,
          goreFactorRatingUsersCount: 0,
          ratingUsersCount: 0,
          worthWatchingDownUsersCount: 0,
          worthWatchingUpUsersCount: 0,
          type: MovieType.Free,
          movieImage: null,
          _id: movie._id.toString(),
        });
      });

      describe('returns the expected movie details having some `MovieUserStatus` records', () => {
        let movie;
        let expectedRating;
        let expectedGoreFactor;
        let expectedWorthWatching;
        let activeUserMovieStatusRating;
        beforeEach(async () => {
          movie = await moviesService.create(
            moviesFactory.build({
              status: MovieActiveStatus.Active,
              logo: null,
            }),
          );
          // activeUser
          const myRating = 3;
          const myGoreFactor = 4;
          const myWorthWatching = WorthWatchingStatus.Up;
          await moviesService.createOrUpdateRating(movie.id, myRating, activeUser.id);
          await moviesService.createOrUpdateGoreFactorRating(movie.id, myGoreFactor, activeUser.id);
          await moviesService.createOrUpdateWorthWatching(movie.id, myWorthWatching, activeUser.id);
          activeUserMovieStatusRating = await moviesService.getUserMovieStatusRatings(movie.id, activeUser.id);
          // user1
          const user1Rating = 1;
          const user1GoreFactor = 1;
          const user1WorthWatching = WorthWatchingStatus.Down;
          await moviesService.createOrUpdateRating(movie.id, user1Rating, user1.id);
          await moviesService.createOrUpdateGoreFactorRating(movie.id, user1GoreFactor, user1.id);
          await moviesService.createOrUpdateWorthWatching(movie.id, user1WorthWatching, user1.id);

          expectedRating = (myRating + user1Rating) / 2;
          expectedGoreFactor = (myGoreFactor + user1GoreFactor) / 2;
          expectedWorthWatching = Math.round((myWorthWatching + user1WorthWatching) / 2);
        });

        it('verify all fields are updated given `movie`', async () => {
          const response = await request(app.getHttpServer())
            .get(`/api/v1/movies/${movie._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();
          expect(response.status).toEqual(HttpStatus.OK);
          expect(response.body).toEqual({
            movieDBId: 1,
            rating: expectedRating,
            goreFactorRating: expectedGoreFactor,
            worthWatching: expectedWorthWatching,
            goreFactorRatingUsersCount: 2,
            ratingUsersCount: 2,
            worthWatchingDownUsersCount: 1,
            worthWatchingUpUsersCount: 1,
            userData: {
              rating: activeUserMovieStatusRating.rating,
              goreFactorRating: activeUserMovieStatusRating.goreFactorRating,
              worthWatching: activeUserMovieStatusRating.worthWatching,
            },
            type: MovieType.MovieDb,
            movieImage: null,
            _id: movie._id.toString(),
          });
        });
      });

      it('returns the expected response when the movie is not found', async () => {
        const nonExistentMovieId = '5d1df8ebe9a186319c225cd6';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/movies/${nonExistentMovieId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'Movie not found',
          statusCode: 404,
        });
      });

      it('when post has a movieId or userId than expected movie details', async () => {
        const movie = await moviesService.create(
          moviesFactory.build({
            status: MovieActiveStatus.Active,
            logo: null,
          }),
        );
        const post = await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser.id,
            movieId: movie._id,
            postType: PostType.MovieReview,
          }),
        );
        const response = await request(app.getHttpServer())
          .get(`/api/v1/movies/${movie._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          movieDBId: 1,
          rating: 0,
          ratingUsersCount: 0,
          goreFactorRating: 0,
          goreFactorRatingUsersCount: 0,
          worthWatching: 0,
          worthWatchingUpUsersCount: 0,
          worthWatchingDownUsersCount: 0,
          userData: {
            rating: 0,
            goreFactorRating: 0,
            worthWatching: 0,
            reviewPostId: post.id,
          },
          _id: movie._id.toString(),
          movieImage: null,
          type: MovieType.MovieDb,
        });
      });
    });
  });
});
