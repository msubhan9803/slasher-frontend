import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { rssFeedProviderFactory } from '../../factories/rss-feed-providers.factory';
import { Friend, FriendDocument } from '../../../src/schemas/friend/friend.schema';
import { FriendRequestReaction } from '../../../src/schemas/friend/friend.enums';
import { RssFeedProvider } from '../../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { RssFeedProvidersService } from '../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { RssFeedProviderFollowsService } from '../../../src/rss-feed-provider-follows/providers/rss-feed-provider-follows.service';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { FeedPostDocument } from '../../../src/schemas/feedPost/feedPost.schema';
import { FeedLikesService } from '../../../src/feed-likes/providers/feed-likes.service';

describe('Feed-Post / Feed Post Like Users (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let user1: UserDocument;
  let user2: UserDocument;
  let user3: UserDocument;
  let rssFeedProviderData: RssFeedProvider;
  let friendsModel: Model<FriendDocument>;
  let rssFeedProviderFollowsService: RssFeedProviderFollowsService;
  let rssFeedProvidersService: RssFeedProvidersService;
  let feedPost: FeedPostDocument;
  let feedLikesService: FeedLikesService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    rssFeedProviderFollowsService = moduleRef.get<RssFeedProviderFollowsService>(RssFeedProviderFollowsService);
    friendsModel = moduleRef.get<Model<FriendDocument>>(getModelToken(Friend.name));
    feedLikesService = moduleRef.get<FeedLikesService>(FeedLikesService);

    app = moduleRef.createNestApplication();
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
    user1 = await usersService.create(userFactory.build());
    user2 = await usersService.create(userFactory.build());
    user3 = await usersService.create(userFactory.build());
    rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
    // Friend Document for `activeUser` and `user1`
    await friendsModel.create({
      from: activeUser._id.toString(),
      to: user1._id.toString(),
      reaction: FriendRequestReaction.Accepted,
    });
    // Friend Document for `activeUser` and `user2`
    await friendsModel.create({
      from: user2._id.toString(),
      to: activeUser._id.toString(),
      reaction: FriendRequestReaction.Accepted,
    });
    await rssFeedProviderFollowsService.create(
      {
        userId: activeUser._id,
        rssfeedProviderId: rssFeedProviderData._id,
      },
    );
    feedPost = await feedPostsService.create(
      feedPostFactory.build({
        userId: activeUser._id,
        rssfeedProviderId: rssFeedProviderData._id,
        createdAt: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        updatedAt: DateTime.fromISO('2022-10-22T00:00:00Z').toJSDate(),
        lastUpdateAt: DateTime.fromISO('2022-10-20T00:00:00Z').toJSDate(),
      }),
    );

    // Create 3 feedPostLike by the user itself, user1, user2
    await feedLikesService.createFeedPostLike(feedPost.id, activeUser.id);
    await feedLikesService.createFeedPostLike(feedPost.id, user1.id);
    await feedLikesService.createFeedPostLike(feedPost.id, user2.id);
  });

  describe('Find Feed Post Like Users', () => {
    it('returns the expected feed post response', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/feed-posts/${feedPost.id}/likes?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([
        {
          _id: activeUser.id,
          userName: activeUser.userName,
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          firstName: activeUser.firstName,
          friendship: null,
        },
        {
          _id: user1.id,
          userName: user1.userName,
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          firstName: user1.firstName,
          friendship: {
            reaction: 3,
            from: activeUser.id,
            to: user1.id,
          },
        },
        {
          _id: user2.id,
          userName: user2.userName,
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          firstName: user2.firstName,
          friendship: {
            reaction: 3,
            from: user2.id,
            to: activeUser.id,
          },
        },
      ]);
    });

    describe('when `offset` argument is supplied', () => {
      beforeEach(async () => {
        // Create 4th like by `user3`
        await feedLikesService.createFeedPostLike(feedPost.id, user3._id.toString());
      });
      it('get expected first and second sets of paginated results', async () => {
        const limit = 2;
        const firstResponse = await request(app.getHttpServer())
          .get(`/feed-posts/${feedPost.id}/likes?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.body).toHaveLength(2);
        expect(firstResponse.body).toEqual([
          {
            _id: activeUser.id,
            userName: activeUser.userName,
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            firstName: activeUser.firstName,
            friendship: null,
          },
          {
            _id: user1.id,
            userName: user1.userName,
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            firstName: user1.firstName,
            friendship: {
              reaction: 3,
              from: activeUser.id,
              to: user1.id,
            },
          },
        ]);

        const secondResponse = await request(app.getHttpServer())
          .get(`/feed-posts/${feedPost.id}/likes?limit=${limit}&offset=2`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.body).toHaveLength(2);
        expect(secondResponse.body).toEqual([
          {
            _id: user2.id,
            userName: user2.userName,
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            firstName: user2.firstName,
            friendship: {
              reaction: 3,
              from: user2.id,
              to: activeUser.id,
            },
          },
          {
            _id: user3.id,
            userName: user3.userName,
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            firstName: user3.firstName,
            friendship: null,
          },
        ]);
      });
    });

    describe('should expected response when no likes exists for the given post', () => {
      let feedPostNotLiked;
      beforeEach(async () => {
        feedPostNotLiked = await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser._id,
            rssfeedProviderId: rssFeedProviderData._id,
            createdAt: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
            updatedAt: DateTime.fromISO('2022-10-22T00:00:00Z').toJSDate(),
            lastUpdateAt: DateTime.fromISO('2022-10-20T00:00:00Z').toJSDate(),
          }),
        );
      });

      it('return empty array when no likes exists found for the given `feedpost`', async () => {
        const limit = 2;
        const response = await request(app.getHttpServer())
          .get(`/feed-posts/${feedPostNotLiked.id}/likes?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([]);
      });
    });

    describe('Validation', () => {
      it('return expected response when feed post not found', async () => {
        const nonExistingFeedPostId = new mongoose.Types.ObjectId().toString();
        const response = await request(app.getHttpServer())
          .get(`/feed-posts/${nonExistingFeedPostId}/likes?limit=${10}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toBe('Post not found');
      });

      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/feed-posts/${feedPost.id}/likes`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          statusCode: 400,
          message: [
            'limit must not be greater than 30',
            'limit must be a number conforming to the specified constraints',
            'limit should not be empty',
          ],
          error: 'Bad Request',
        });
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/feed-posts/${feedPost.id}/likes?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toEqual([
          'limit must not be greater than 30',
          'limit must be a number conforming to the specified constraints',
        ]);
      });

      it('limit should not be grater than 30', async () => {
        const limit = 31;
        const response = await request(app.getHttpServer())
          .get(`/feed-posts/${feedPost.id}/likes?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: ['limit must not be greater than 30'],
          statusCode: 400,
        });
      });

      it('`offset` must be number', async () => {
        const limit = 3;
        const offset = 'abc';
        const response = await request(app.getHttpServer())
          .get(`/feed-posts/${feedPost.id}/likes?limit=${limit}&offset=${offset}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          statusCode: 400,
          message: ['offset must be a number conforming to the specified constraints'],
        });
      });
    });
  });
});
