import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User, UserDocument } from '../../../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { rssFeedProviderFactory } from '../../../../factories/rss-feed-providers.factory';
import { Friend, FriendDocument } from '../../../../../src/schemas/friend/friend.schema';
import { FriendRequestReaction } from '../../../../../src/schemas/friend/friend.enums';
import { RssFeedProvider } from '../../../../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { RssFeedProvidersService } from '../../../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { RssFeedProviderFollowsService } from '../../../../../src/rss-feed-provider-follows/providers/rss-feed-provider-follows.service';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import getMainFeedPostResponse from '../../../../fixtures/feed-post/main-feed-posts-response';
import { FeedPostDocument } from '../../../../../src/schemas/feedPost/feedPost.schema';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { Movie } from '../../../../../src/schemas/movie/movie.schema';
import { MoviesService } from '../../../../../src/movies/providers/movies.service';
import { MovieActiveStatus } from '../../../../../src/schemas/movie/movie.enums';
import { moviesFactory } from '../../../../factories/movies.factory';
import { Hashtag, HashtagDocument } from '../../../../../src/schemas/hastag/hashtag.schema';
import { HashtagFollowsService } from '../../../../../src/hashtag-follows/providers/hashtag-follows.service';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';

describe('Feed-Post / Main Feed Posts (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let user1: User;
  let user2: User;
  let rssFeedProviderData: RssFeedProvider;
  let rssFeedProviderData2: RssFeedProvider;
  let friendsModel: Model<FriendDocument>;
  let rssFeedProviderFollowsService: RssFeedProviderFollowsService;
  let rssFeedProvidersService: RssFeedProvidersService;
  let movie: Movie;
  let moviesService: MoviesService;
  let hashtagFollowsService: HashtagFollowsService;
  let hashtagModel: Model<HashtagDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    rssFeedProviderFollowsService = moduleRef.get<RssFeedProviderFollowsService>(RssFeedProviderFollowsService);
    friendsModel = moduleRef.get<Model<FriendDocument>>(getModelToken(Friend.name));
    hashtagModel = moduleRef.get<Model<HashtagDocument>>(getModelToken(Hashtag.name));
    hashtagFollowsService = moduleRef.get<HashtagFollowsService>(HashtagFollowsService);

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
    user2 = await usersService.create(userFactory.build());
    rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
    rssFeedProviderData2 = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
    await friendsModel.create({
      from: activeUser._id,
      to: user1._id.toString(),
      reaction: FriendRequestReaction.Accepted,
    });
    await friendsModel.create({
      from: user2._id.toString(),
      to: activeUser._id,
      reaction: FriendRequestReaction.Accepted,
    });
    await rssFeedProviderFollowsService.create(
      {
        userId: activeUser._id,
        rssfeedProviderId: rssFeedProviderData._id,
      },
    );
    await rssFeedProviderFollowsService.create(
      {
        userId: activeUser._id,
        rssfeedProviderId: rssFeedProviderData2._id,
      },
    );
    movie = await moviesService.create(
      moviesFactory.build(
        {
          name: 'Shawshank Redemption',
          status: MovieActiveStatus.Active,
          releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          logo: 'https://picsum.photos/id/237/200/300',
        },
      ),
    );
    await feedPostsService.create(
      feedPostFactory.build({
        userId: activeUser._id,
        rssfeedProviderId: rssFeedProviderData._id,
        createdAt: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        updatedAt: DateTime.fromISO('2022-10-22T00:00:00Z').toJSDate(),
        lastUpdateAt: DateTime.fromISO('2022-10-20T00:00:00Z').toJSDate(),
        likes: [activeUser.id, user1._id.toString()],
      }),
    );
    await feedPostsService.create(
      feedPostFactory.build({
        userId: user1._id,
        rssfeedProviderId: rssFeedProviderData2._id,
        createdAt: DateTime.fromISO('2022-10-18T00:00:00Z').toJSDate(),
        updatedAt: DateTime.fromISO('2022-10-23T00:00:00Z').toJSDate(),
        lastUpdateAt: DateTime.fromISO('2022-10-19T00:00:00Z').toJSDate(),
        // Feedpost with a movie (feature: Share movie as a post)
        movieId: movie._id,
      }),
    );
  });

  describe('GET /api/v1/feed-posts', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/feed-posts').expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns the expected feed post response', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-posts?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      for (let i = 1; i < response.body.length; i += 1) {
        expect(response.body[i].lastUpdateAt < response.body[i - 1].lastUpdateAt).toBe(true);
      }
      expect(response.body).toEqual(getMainFeedPostResponse);
    });

    it('when post user profile_status is private than expected response', async () => {
      const user = await usersService.create(userFactory.build({
        profile_status: ProfileVisibility.Private,
      }));
      const hashtag1 = await hashtagModel.create({
        name: 'scariness',
      });
      const hashtag2 = await hashtagModel.create({
        name: 'funnymouse',
      });
      await hashtagFollowsService.create({
        userId: activeUser._id,
        hashTagId: hashtag1._id,
      });
      await hashtagFollowsService.create({
        userId: activeUser._id,
        hashTagId: hashtag2._id,
      });
      const post = await feedPostsService.create(
        feedPostFactory.build({
          userId: user.id,
          message: 'newPost #scariness #funnymouse',
        }),
      );
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-posts?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      for (let i = 1; i < response.body.length; i += 1) {
        expect(response.body[i].lastUpdateAt < response.body[i - 1].lastUpdateAt).toBe(true);
        expect(response.body[i]._id).not.toEqual(post._id);
      }
      expect(response.body).toHaveLength(2);
    });

    describe('when `before` argument is supplied', () => {
      beforeEach(async () => {
        for (let index = 0; index < 3; index += 1) {
          await feedPostsService.create(
            feedPostFactory.build({
              userId: user1._id,
              rssfeedProviderId: rssFeedProviderData2._id,
            }),
          );
        }
      });
      it('get expected first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResponse = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.body).toHaveLength(3);
        for (let index = 1; index < firstResponse.body.length; index += 1) {
          expect(firstResponse.body[index].lastUpdateAt < firstResponse.body[index - 1].lastUpdateAt).toBe(true);
        }

        const secondResponse = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts?limit=${limit}&before=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.body).toHaveLength(2);
        for (let index = 1; index < secondResponse.body.length; index += 1) {
          expect(secondResponse.body[index].lastUpdateAt < secondResponse.body[index - 1].lastUpdateAt).toBe(true);
        }
      });
    });

    describe('Main Feed should NOT include hidden posts for activeUser', () => {
      let feedPost: FeedPostDocument;
      beforeEach(async () => {
        // Create post by `user1`
        feedPost = await feedPostsService.create(
          feedPostFactory.build({
            userId: user1._id,
            rssfeedProviderId: rssFeedProviderData2._id,
          }),
        );
      });

      it('returns the expected feed post response, which does *not* include posts hidden by activeUser', async () => {
        const limit = 5;

        // Hide the post
        await feedPostsService.hidePost(feedPost.id, activeUser.id);

        // Verify that hidden post is not included in the response
        const response2 = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        const ids: string[] = response2.body.map((post) => post._id);
        expect(ids).toHaveLength(2);
        const hiddenPost = ids.findIndex((id) => id === feedPost.id);
        expect(hiddenPost).toBe(-1);
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 30', async () => {
        const limit = 31;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 30');
      });

      it('`before` must match regular expression', async () => {
        const limit = 3;
        const before = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts?limit=${limit}&before=${before}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain(
          'before must be a mongodb id',
        );
      });
    });
  });
});
